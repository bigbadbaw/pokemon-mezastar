Analyze the tag scanner module and help me test or improve Mezastar tag recognition.

If given a file path as argument, analyze that image as if it were a Pokémon Mezastar tag photo.

Requirements:
- Check that src/lib/claude-vision.ts handles the Claude Vision API correctly
- Verify the tag data schema extracts: Pokémon name, Energy (ポケエネ), Grade (1-6), stats (HP/Atk/Def/SpAtk/SpDef/Spd), type(s), move(s), collection number
- Tags are stadium-shaped plastic tiles (36×64mm) — not rectangular cards
- The QR code on the reverse contains the machine-readable data
- Front shows the Pokémon artwork, name, type icons, and Energy value
- Reverse shows the detailed stats grid
- Handle both front and back photos separately
- Error handling: blurry photos, non-tag images, multiple tags in frame, glare on plastic

$ARGUMENTS
