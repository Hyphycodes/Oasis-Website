/** Small decorative companions; their event flyer remains the authoritative event artwork. */
export type ThemeCharacterName = 'snoopy'|'scream'|'kitty'|'myers'|'roses'|'angel'|'pumpkin'|'selena'|'junior';
export function ThemeCharacter({name,className = ''}: {name:ThemeCharacterName;className?:string}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/themes/halloween-dotd/characters/${name}.webp`} alt="" aria-hidden="true" width={480} height={480} loading="lazy" decoding="async" className={`theme-character ${className}`} />;
}
