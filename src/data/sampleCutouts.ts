/**
 * Original SVG Cutout Illustrations for the 10 Sample Items
 * Designed per docs/SPEC.md Section 3: flat, soft shading, clean lines, no brands or logos.
 */
export const SAMPLE_CUTOUT_SVGS: Record<string, string> = {
  'cream-knit-sweater': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="180" rx="60" ry="8" fill="rgba(0,0,0,0.06)" />
    <!-- Sweater Body -->
    <path d="M65 50 C80 60, 120 60, 135 50 L155 70 L140 100 L125 90 L125 155 C125 160, 75 160, 75 155 L75 90 L60 100 L45 70 Z" fill="#F4EFE6" stroke="#D8CEBC" stroke-width="2" stroke-linejoin="round"/>
    <!-- Collar -->
    <path d="M80 50 C90 56, 110 56, 120 50 C115 62, 85 62, 80 50 Z" fill="#E8DEC9" stroke="#D8CEBC" stroke-width="1.5"/>
    <!-- Texture ribs -->
    <line x1="85" y1="75" x2="85" y2="150" stroke="#E2D7C2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="100" y1="70" x2="100" y2="152" stroke="#E2D7C2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="115" y1="75" x2="115" y2="150" stroke="#E2D7C2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Hem ribs -->
    <path d="M75 152 L125 152" stroke="#D8CEBC" stroke-width="3"/>
  </svg>`,

  'navy-linen-shirt': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="180" rx="60" ry="8" fill="rgba(0,0,0,0.06)" />
    <!-- Shirt Body -->
    <path d="M70 45 L100 55 L130 45 L155 70 L140 95 L125 85 L125 160 L75 160 L75 85 L60 95 L45 70 Z" fill="#1E2B3E" stroke="#141E2C" stroke-width="2" stroke-linejoin="round"/>
    <!-- Collar Lapels -->
    <path d="M85 45 L100 65 L90 75 L70 45 Z" fill="#283952" stroke="#141E2C" stroke-width="1.5"/>
    <path d="M115 45 L100 65 L110 75 L130 45 Z" fill="#283952" stroke="#141E2C" stroke-width="1.5"/>
    <!-- Placket & Buttons -->
    <line x1="100" y1="65" x2="100" y2="160" stroke="#141E2C" stroke-width="2"/>
    <circle cx="100" cy="85" r="2" fill="#E8DEC9"/>
    <circle cx="100" cy="105" r="2" fill="#E8DEC9"/>
    <circle cx="100" cy="125" r="2" fill="#E8DEC9"/>
    <circle cx="100" cy="145" r="2" fill="#E8DEC9"/>
  </svg>`,

  'olive-chinos': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="185" rx="55" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- Trousers Shape -->
    <path d="M72 40 L128 40 L124 175 L104 175 L100 85 L96 175 L76 175 Z" fill="#525F45" stroke="#3D4733" stroke-width="2" stroke-linejoin="round"/>
    <!-- Waistband & Fly -->
    <line x1="72" y1="48" x2="128" y2="48" stroke="#3D4733" stroke-width="1.5"/>
    <line x1="100" y1="48" x2="100" y2="75" stroke="#3D4733" stroke-width="1.5"/>
    <!-- Pockets -->
    <path d="M78 48 L88 65" stroke="#3D4733" stroke-width="1.5"/>
    <path d="M122 48 L112 65" stroke="#3D4733" stroke-width="1.5"/>
  </svg>`,

  'white-leather-sneakers': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="175" rx="65" ry="8" fill="rgba(0,0,0,0.06)" />
    <!-- Left Sneaker Profile -->
    <path d="M45 140 C45 130, 60 115, 85 118 C100 120, 115 135, 145 138 C155 139, 160 148, 155 155 L45 155 Z" fill="#FFFFFF" stroke="#D1CCC2" stroke-width="2" stroke-linejoin="round"/>
    <!-- Sole -->
    <path d="M43 155 L157 155 C157 162, 150 165, 140 165 L48 165 C43 165, 43 158, 43 155 Z" fill="#F0EBE1" stroke="#D1CCC2" stroke-width="1.5"/>
    <!-- Laces & Eyelets -->
    <path d="M80 120 L95 135 M90 120 L105 135" stroke="#BFB8A9" stroke-width="2"/>
    <circle cx="75" cy="142" r="2" fill="#D1CCC2"/>
  </svg>`,

  'black-wool-coat': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="190" rx="65" ry="8" fill="rgba(0,0,0,0.06)" />
    <!-- Coat Body -->
    <path d="M68 35 L100 45 L132 35 L160 65 L145 105 L135 95 L140 180 L60 180 L65 95 L55 105 L40 65 Z" fill="#202022" stroke="#111112" stroke-width="2" stroke-linejoin="round"/>
    <!-- Tailored Lapels -->
    <path d="M82 35 L100 75 L82 90 L68 35 Z" fill="#2D2D30" stroke="#111112" stroke-width="1.5"/>
    <path d="M118 35 L100 75 L118 90 L132 35 Z" fill="#2D2D30" stroke="#111112" stroke-width="1.5"/>
    <!-- Buttons -->
    <circle cx="105" cy="98" r="3" fill="#111112" stroke="#444" stroke-width="1"/>
    <circle cx="105" cy="122" r="3" fill="#111112" stroke="#444" stroke-width="1"/>
    <circle cx="105" cy="146" r="3" fill="#111112" stroke="#444" stroke-width="1"/>
  </svg>`,

  'denim-jacket': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="175" rx="60" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- Denim Body -->
    <path d="M65 48 L100 56 L135 48 L160 70 L145 100 L132 90 L132 145 L68 145 L68 90 L55 100 L40 70 Z" fill="#425E7D" stroke="#2C4057" stroke-width="2" stroke-linejoin="round"/>
    <!-- Collar -->
    <path d="M80 48 L100 66 L120 48" fill="#364E68" stroke="#2C4057" stroke-width="2"/>
    <!-- Pockets & Seams -->
    <rect x="74" y="80" width="18" height="16" rx="2" fill="#364E68" stroke="#2C4057" stroke-width="1.5"/>
    <rect x="108" y="80" width="18" height="16" rx="2" fill="#364E68" stroke="#2C4057" stroke-width="1.5"/>
    <!-- Buttons -->
    <circle cx="100" cy="80" r="2.5" fill="#C5A059"/>
    <circle cx="100" cy="102" r="2.5" fill="#C5A059"/>
    <circle cx="100" cy="124" r="2.5" fill="#C5A059"/>
  </svg>`,

  'striped-tee': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="175" rx="55" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- T-Shirt Shape -->
    <path d="M70 48 C85 55, 115 55, 130 48 L152 70 L138 88 L126 80 L126 150 L74 150 L74 80 L62 88 L48 70 Z" fill="#FAF8F5" stroke="#D1CCC2" stroke-width="2" stroke-linejoin="round"/>
    <!-- Stripes -->
    <line x1="74" y1="75" x2="126" y2="75" stroke="#1E2B3E" stroke-width="3"/>
    <line x1="74" y1="90" x2="126" y2="90" stroke="#1E2B3E" stroke-width="3"/>
    <line x1="74" y1="105" x2="126" y2="105" stroke="#1E2B3E" stroke-width="3"/>
    <line x1="74" y1="120" x2="126" y2="120" stroke="#1E2B3E" stroke-width="3"/>
    <line x1="74" y1="135" x2="126" y2="135" stroke="#1E2B3E" stroke-width="3"/>
    <!-- Crew Neck -->
    <path d="M82 48 C90 56, 110 56, 118 48" stroke="#D1CCC2" stroke-width="2"/>
  </svg>`,

  'grey-tailored-trousers': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="185" rx="55" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- Trouser Legs -->
    <path d="M72 40 L128 40 L122 175 L103 175 L100 85 L97 175 L78 175 Z" fill="#75777A" stroke="#525457" stroke-width="2" stroke-linejoin="round"/>
    <!-- Pressed Creases -->
    <line x1="88" y1="52" x2="88" y2="173" stroke="#909296" stroke-width="1.5"/>
    <line x1="112" y1="52" x2="112" y2="173" stroke="#909296" stroke-width="1.5"/>
    <!-- Waistband -->
    <line x1="72" y1="46" x2="128" y2="46" stroke="#525457" stroke-width="1.5"/>
  </svg>`,

  'tan-boots': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="180" rx="60" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- Boot Profile -->
    <path d="M60 85 L90 85 L92 125 C105 125, 120 135, 150 145 C155 147, 156 156, 150 162 L60 162 Z" fill="#A86F45" stroke="#7A4E2C" stroke-width="2" stroke-linejoin="round"/>
    <!-- Boot Elastic / Detail -->
    <path d="M72 85 L70 120 L80 120 L78 85" fill="#5E381C" stroke="#7A4E2C" stroke-width="1.5"/>
    <!-- Sole & Heel -->
    <path d="M58 162 L152 162 L150 168 L60 168 Z" fill="#3D2513" stroke="#25160A" stroke-width="1.5"/>
    <rect x="58" y="168" width="22" height="6" fill="#3D2513" stroke="#25160A" stroke-width="1"/>
  </svg>`,

  'floral-summer-dress': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <ellipse cx="100" cy="185" rx="60" ry="7" fill="rgba(0,0,0,0.06)" />
    <!-- Dress Bodice and Skirt -->
    <path d="M82 45 C90 52, 110 52, 118 45 L124 85 C115 90, 85 90, 76 85 Z" fill="#F4E9E2" stroke="#D1B8AC" stroke-width="2" stroke-linejoin="round"/>
    <path d="M76 85 C85 90, 115 90, 124 85 L155 170 C130 178, 70 178, 45 170 Z" fill="#F4E9E2" stroke="#D1B8AC" stroke-width="2" stroke-linejoin="round"/>
    <!-- Floral Petals Accent Details -->
    <circle cx="85" cy="115" r="3" fill="#C8745A"/>
    <circle cx="115" cy="125" r="3" fill="#C8745A"/>
    <circle cx="95" cy="145" r="3" fill="#C8745A"/>
    <circle cx="130" cy="155" r="3" fill="#C8745A"/>
    <circle cx="70" cy="150" r="3" fill="#C8745A"/>
    <circle cx="105" cy="100" r="2.5" fill="#3B7A57"/>
  </svg>`,
};
