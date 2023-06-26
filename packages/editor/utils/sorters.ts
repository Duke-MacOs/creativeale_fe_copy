export const stringSorter = (s1: string, s2: string) => (s1 > s2 ? 1 : s1 < s2 ? -1 : 0);

export const filenameSorter = (s1: string, s2: string): number => {
  const [{ head: h1, digits: d1, tail: t1 }, { head: h2, digits: d2, tail: t2 }] = [s1, s2].map(s => {
    const r = /\d+/.exec(s);
    if (r) {
      return { head: s.slice(0, r.index), digits: r[0], tail: s.slice(r.index + r[0].length) };
    } else {
      return { head: s, digits: '', tail: '' };
    }
  });
  if (d1 && d2) {
    return stringSorter(h1, h2) || Number(d1) - Number(d2) || filenameSorter(t1, t2);
  }
  return stringSorter(s1, s2);
};
