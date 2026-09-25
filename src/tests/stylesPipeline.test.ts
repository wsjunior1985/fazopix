import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { describe, expect, it } from 'vitest';

describe('Tailwind CSS pipeline', () => {
  it('emits the layout utilities used by the application', async () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles.css');
    const source = await fs.readFile(cssPath, 'utf8');
    const result = await postcss([tailwindcss()]).process(source, { from: cssPath });

    expect(result.css).toContain('.p-5');
    expect(result.css).toContain('.gap-3');
    expect(result.css).toContain('.lg\\:order-2');
  });
});
