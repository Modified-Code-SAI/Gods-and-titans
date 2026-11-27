# foliage-cost-and-outcrops

> Measured cost of the foliage pass (software rasterizer, where it comes from, the lean-Low option) and the decorOffOutcrops rule that keeps plants and boulders off sandstone outcrops

Follow-up to [foliage-look](foliage-look.md) (PR #21), measured 2026-10-21 on the merged build.

- **Cost**: against main, triangles -25 to -30%, draw calls +0 to +2, frame time +6 to +16% on a software rasterizer (Low +14 to 16, Medium +7 to 9, High +6 to 12; ratios only, +-5% noise, single runs drift 10 to 15%, so alternate the two builds in one browser and take medians). It is all fragment work: a broadleaf crown is about five layers of overdraw. Hiding one tree type at a time showed only the broadleaf got costlier (+50%); spruce, birch and undergrowth equal or cheaper. At 320x180 the builds tie. Anisotropy, alpha to coverage and sphere depth: free within noise. The hidden core puff was dropped (invisible from the 50 to 58 degree camera).
- **If Low feels heavy on the owner's laptop**: a leaner Low crown (no skirt or shell puffs, about half the puffs) measured +5% instead of +14%; note that without the skirt the trunk shows below the crown.
- **Outcrops**: `decorOffOutcrops(map, list)` in props.js drops decor where the ground field's outcrop rise ([terrain-ground-field](terrain-ground-field.md)) is over 0.05 (plants, ruins) or over 0.3 (boulders): used for map decor, undergrowth and rock-tile boulders. Rise is 0 outside the rock tiles and 0.3 to 0.75 inside. Without it, boulders and grass tufts looked pasted onto the smooth sandstone pillars.
- Shore stones still use the old tile rule and look fine on the new coasts; placing them from the field's shore distance is an open idea.

**Why:** the next person to touch crowns or decor should know the cost is overdraw, not triangles, and why decor avoids outcrops.
**How to apply:** trim puffs or area before adding any per-fragment work; call decorOffOutcrops for any new decor list placed on the map.
