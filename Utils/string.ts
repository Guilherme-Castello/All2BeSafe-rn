export const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, ''); // Remove os acentos
};