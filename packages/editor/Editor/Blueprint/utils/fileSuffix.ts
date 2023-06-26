export function withTsSuffix(name: string) {
  if (name.endsWith('.ts')) {
    return name;
  }

  if (name.endsWith('.js')) {
    return name.replace('.js', '.ts');
  }

  return `${name}.ts`;
}

export function withoutFileSuffix(name: string) {
  return name.replace(/\.\w+$/, '');
}
