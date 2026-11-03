# Expedition 1.1 defender delivery

The nine defender WebPs now use proportional 192px maximum derivatives, rebuilt from the same preserved PNG sources with Pillow 12.2.0/libwebp 1.6.0, LANCZOS resampling and unchanged WebP quality 90/method 6/exact/alpha-quality 100. Aggregate delivery falls from 332,370 to 125,742 bytes. The decoded alpha matches the resampled source exactly; visible bounds and runtime foot anchors are recorded.

Run `python3 scripts/prepare-delivery-1.1.py` from `web/`. The authoritative source/output hashes, prior hashes, geometry, alpha bounds and script hash are in `art-source/expedition-1.1/defender-delivery.json`; the small generated runtime geometry module is under `src/game/`. Full-resolution sources and all historical conversion records remain intact and outside the deployable build.

World widths remain 67–96 pixels and card portraits retain their 34×35px slot. No new illustration, sprite anatomy, animation pose, gameplay rule or school image is introduced. All six alien atlases remain byte-identical to Expedition 1.0, totaling 699,038 bytes/248 poses. Static alien portraits remain available on demand in the Field Guide.

This record documents derivation, not blanket publication clearance. Retained school artwork, projectiles, names and historical comparison still need their separate permission/identity review. See `web/ASSET_CREDITS.md` and the Expedition 1.1 publication inventory in the repository.
