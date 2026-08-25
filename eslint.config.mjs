// Guardrail for the package layering (see CLAUDE.md): client and core are
// framework-free by contract — React belongs in packages/react, Astro in the
// app. Everything else eslint could check is covered by tsc strict.
import tseslint from 'typescript-eslint'

export default [
    { ignores: ['**/dist/**', '**/schema.d.ts'] },
    {
        files: ['packages/client/src/**/*.ts', 'packages/core/src/**/*.ts'],
        languageOptions: { parser: tseslint.parser },
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
                            message: 'client/core are framework-free — React bindings live in @cloomba/react.',
                        },
                        {
                            group: ['astro', 'astro/*', '@astrojs/*'],
                            message: 'client/core are framework-free — Astro code lives in apps/astro-theme.',
                        },
                    ],
                },
            ],
        },
    },
]
