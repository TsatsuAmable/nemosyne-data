# Quest qualification corpus

This repository supplies reproducible input identities for Nemosyne physical-headset qualification. It complements the device telemetry protocol in `TsatsuAmable/nemosyne`; it does not replace physical Quest evidence.

## Qualification identity

Every recorded run should retain all of the following together:

- Nemosyne commit or release;
- corpus version from `manifests/catalog.json`;
- dataset ID;
- tier;
- artifact role;
- artifact SHA-256;
- headset model, firmware, browser identity and run label.

A result that cannot identify its exact input artifact is not reproducible qualification evidence.

## Tiers

The common row-count vocabulary is:

| Tier | Rows | Intended use |
| --- | ---: | --- |
| `smoke` | 1,000 | parser, correctness and fast headset checks |
| `small` | 8,000 | baseline render/interaction checks |
| `medium` | 65,000 | scale characterization |
| `large` | 100,000 | sustained performance soak |
| `xlarge` | 250,000 | stretch characterization |

Only artifacts listed in a dataset's `artifacts` array are materialized. `plannedTiers` is a roadmap, not a claim that a file exists.

## Synthetic controls

The committed smoke fixtures are deterministic and intentionally transparent:

- `synthetic.linear-truth` contains the exact relation `y = 3*x + 7`;
- `synthetic.clustered-truth` contains four separated 3D clusters with authoritative labels;
- `synthetic.missingness-truth` encodes documented missingness rules;
- `synthetic.null-control` is a fixed-seed negative control with no intentionally encoded cross-variable relation.

The null control is not guaranteed to look featureless. Random-looking finite data can contain chance structure. Any analysis that elevates such structure should be treated as a warning signal for apophenia or insufficient multiple-testing discipline.

## Real-source snapshots

Files under `sources/` describe upstream data and acquisition policy. The acquisition workflow writes the downloaded bytes and a receipt into a CI artifact for review. It does not auto-commit third-party data. A reviewer must confirm licensing, provenance, transformations and scientific suitability before adding a snapshot to `data/real/` and registering it in the catalog.

## Larger tiers

Run `npm run generate:synthetic -- <tier>` to regenerate deterministic synthetic tiers locally. Large generated files are deliberately excluded from ordinary Git history. Publish qualification-scale artifacts as reviewed release assets or in a dedicated large-file mechanism, then register immutable URLs and hashes in a frozen release catalog.

The separate 10M Rust/WASM boundary fixture in Nemosyne remains a device-boundary control. Do not relabel a smaller corpus tier as a 10M qualification result.
