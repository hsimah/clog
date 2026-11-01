# Release Codename Prompt

This file contains a guiding prompt for an LLM that will be used whenever we
need to invent a new release codename for the Clog project.

Releases are tagged `X.Y` and the GitHub release title is the codename. A
codename is two title-case words: a *space/astronomy term* followed by a *dog
breed*, preferably a spitz-type. Space terms can be `Rocket`, `Nebula`,
`Orbit`, `Satellite`, `Comet`, `Lunar`, `Pulsar`, etc.; dogs can be `Husky`,
`Pomeranian`, `Pomsky`, `Shiba`, `Akita`, etc. Recent names alliterate.

Past releases:

| Tag | Codename |
| --- | --- |
| 0.1 | Stellar Lapphund |
| 0.2 | Aurora Akita |
| 1.0 | Comet Corgi |
| 1.1 | Nebula Newfoundland |
| 1.2 | Pulsar Pug |

When generating a name the LLM should:

1. **Check the published releases** (`gh release list`) so the new name repeats
   neither word pair nor dog breed from a previous release. If you cannot check,
   tell the human to double-check.
2. **Produce exactly one suggestion** in the form `Space Dog`, space-separated
   and title case. A multi-word breed stays as one word (`Kleekai`).
3. Avoid offensive or trademarked names; keep it lighthearted.

You may add a brief justification sentence after the suggestion, for example:

```
Release 1.3: "Kuiper Keeshond" (space term + spitz breed, alliterative, unused).
```

After publishing a release, add it to the table above.
