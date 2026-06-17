# Evaluation data — Total Average Return (TAR), per seed

This bundle contains the per-seed evaluation data behind the main results table
of the paper (DMControl + HumanoidBench locomotion + HumanoidBench whole-body
manipulation), so other researchers can reproduce the table and reuse the
learning curves.

> Anonymized for review. Run identifiers are opaque W&B IDs and carry no
> identifying information.

## What "TAR" means and how each number is scored

- A **TAR curve** is the episode return at each periodic evaluation during
  training (`step, episode_reward`), one file per seed.
- A **per-seed score** is the mean of that seed's **final five evaluations**
  with `step ≤ B`, where the budget `B` is **3.0M** environment steps for
  **Ours** and **DreamerV3**, and **2.0M** for **TD-MPC2** and **BMPC**.
- A **table cell** is `mean ± std` (sample std, `ddof=1`) over seeds, rounded to
  the nearest integer.

The exact final-five window each seed contributes is in `per_seed_scores.csv`
(column `last5_mean`).

## Layout

```
eval_data/
├── paper_main_table.csv        every cell of the paper table: value + provenance + per-seed?
├── per_seed_scores.csv         one row per seed: final-window score, run id, max step, source
├── reported_only_cells.csv     cells reported from external sources (no per-seed data here)
├── eval_data.json              the tables above, consolidated for programmatic use
├── our_runs/                   per-seed FULL curves we produced or were given
│   ├── ours/{dmcontrol,humanoidbench}/<task>/seed<k>__<runid>.csv
│   ├── bmpc/humanoidbench/<task>/seed<k>__<runid>.csv      (provided by the BMPC authors)
│   └── tdmpc2/humanoidbench/<task>/seed<k>__<runid>.csv    (our TD-MPC2 re-runs, locomotion)
└── external_reference/
    └── humanoidbench_official/tdmpc2/humanoidbench/<task>/seed<k>__<runid>.csv
```

Each curve file is a 2-column CSV: `step, episode_reward`.

## Provenance (matches the paper's "Baselines" paragraph)

| Column in the paper | Source of the data |
|---|---|
| **Ours** | Our W&B runs. Full per-seed curves in `our_runs/ours/`. |
| **BMPC** (HumanoidBench locomotion) | Per-seed curves **provided by the BMPC authors**. In `our_runs/bmpc/`. |
| **TD-MPC2** (HumanoidBench locomotion) | **Our re-runs**. In `our_runs/tdmpc2/`. |
| **TD-MPC2** (HumanoidBench WBM) | **HumanoidBench official release** (per-seed). In `external_reference/`. |
| **DreamerV3** | Reported from the **BMPC paper** (Wang et al. 2025) and **HumanoidBench** official results. Reported values only (no per-seed). |
| **BOOM** | Reported from the BOOM paper (Zhan et al. 2026). Reported values only. |
| **TD-M(PC)²** (marked `*`) | Plot-digitized from the published TD-M(PC)² curves. Reported values only. |
| **DMControl baselines** (DreamerV3 / TD-MPC2 / BMPC) | Reported in the respective papers. Reported values only. |

`reported_only_cells.csv` lists every cell that has a printed value but no
per-seed curve in this bundle (the external / reported baselines above).

## Incomplete / below-budget seeds

`per_seed_scores.csv` has a `below_budget` flag for seeds that ended more than
one 50k-eval interval short of the budget — the four below-3M DMControl tasks
the paper marks with a dagger (`dog-stand`, `dog-trot`, `humanoid-stand`,
`humanoid-walk`) and a few HumanoidBench seeds still in flight at submission.
Their scores use the evaluations actually logged; where a figure carries a curve
to the full budget, the last logged value was held flat (no trend invented).

## Regenerate

`compute_results/build_eval_export.py` rebuilds this folder from the source
curves.
