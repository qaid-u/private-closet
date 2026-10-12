import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { INITIAL_DEMO_WARDROBE } from '@/lib/demoData';
import { AvailabilityStatus } from '@/types/wardrobe';

const ALLOWED_AVAILABILITY_STATUSES = new Set<AvailabilityStatus>([
  'Available',
  'In Laundry',
  'Being Repaired',
  'In Storage',
  'Unavailable',
  'Archived',
]);

interface WardrobeImageRow {
  is_primary?: boolean | null;
  storage_path?: string | null;
}

function parseDataUri(dataUri: string): { buffer: Buffer; mimeType: string; extension: string } | null {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  return { buffer: Buffer.from(match[2], 'base64'), mimeType, extension };
}

export async function GET(_req: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    // Demo fallback mode
    return NextResponse.json({
      data: INITIAL_DEMO_WARDROBE,
      source: 'demo_fallback',
    });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*, wardrobe_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const itemsWithSignedImages = await Promise.all(
    (data ?? []).map(async (item) => {
      const wardrobeImages = Array.isArray(item.wardrobe_images)
        ? (item.wardrobe_images as WardrobeImageRow[])
        : [];
      const primaryImage = wardrobeImages.length > 0
        ? wardrobeImages.find((image) => image.is_primary) ?? wardrobeImages[0]
        : null;

      if (!primaryImage?.storage_path) {
        return item;
      }

      const { data: signedData } = await supabase.storage
        .from('wardrobe-images')
        .createSignedUrl(primaryImage.storage_path, 60 * 60);

      return {
        ...item,
        image_url: signedData?.signedUrl,
      };
    })
  );

  return NextResponse.json({ data: itemsWithSignedImages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServerClient();
    const imageDataUrl = typeof body.image_data_url === 'string' ? body.image_data_url : undefined;
    delete body.image_data_url;

    if (!supabase) {
      // Local/demo simulation
      const newItem = {
        ...body,
        id: `item-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        wear_count: 0,
      };
      return NextResponse.json({ data: newItem, source: 'demo' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const insertBody = {
      ...body,
      user_id: authData.user.id,
    };

    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert([insertBody])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (imageDataUrl) {
      const parsed = parseDataUri(imageDataUrl);
      if (parsed) {
        const storagePath = `${authData.user.id}/${data.id}.${parsed.extension}`;
        const { error: uploadError } = await supabase.storage
          .from('wardrobe-images')
          .upload(storagePath, parsed.buffer, {
            contentType: parsed.mimeType,
            upsert: true,
          });

        if (uploadError) {
          return NextResponse.json({ error: uploadError.message }, { status: 400 });
        }

        const { error: imageError } = await supabase.from('wardrobe_images').insert({
          item_id: data.id,
          user_id: authData.user.id,
          storage_path: storagePath,
          is_primary: true,
          mime_type: parsed.mimeType,
          file_size_bytes: parsed.buffer.byteLength,
        });

        if (imageError) {
          return NextResponse.json({ error: imageError.message }, { status: 400 });
        }

        const { data: signedData } = await supabase.storage
          .from('wardrobe-images')
          .createSignedUrl(storagePath, 60 * 60);

        return NextResponse.json({
          data: {
            ...data,
            image_url: signedData?.signedUrl,
          },
        });
      }
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = typeof body.id === 'string' ? body.id : null;
    const updates = body.updates && typeof body.updates === 'object' ? body.updates : null;

    if (!itemId || !updates) {
      return NextResponse.json({ error: 'Item id and updates are required' }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof updates.is_favourite === 'boolean') {
      patch.is_favourite = updates.is_favourite;
    }
    if (typeof updates.availability_status === 'string') {
      if (!ALLOWED_AVAILABILITY_STATUSES.has(updates.availability_status as AvailabilityStatus)) {
        return NextResponse.json({ error: 'Invalid availability status' }, { status: 400 });
      }
      patch.availability_status = updates.availability_status;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No supported updates were provided' }, { status: 400 });
    }

    patch.updated_at = new Date().toISOString();

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ data: { id: itemId, ...patch }, source: 'demo' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('wardrobe_items')
      .update(patch)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
