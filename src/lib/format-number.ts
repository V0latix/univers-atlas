const englishNumberFormatter = new Intl.NumberFormat("en-US");

export const formatNumber = (value: number) =>
  englishNumberFormatter.format(value);
