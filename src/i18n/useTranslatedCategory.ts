import { useTranslation } from "react-i18next";

/**
 * Translates a Portuguese category name to the active language.
 * Falls back to the original Portuguese name if no translation is registered.
 */
export const useTranslatedCategory = () => {
  const { t, i18n } = useTranslation();
  return (categoryPt: string | undefined | null): string => {
    if (!categoryPt) return "";
    const key = `categories.${categoryPt}`;
    const translated = t(key);
    // i18next returns the key itself when missing — fall back to original.
    return translated === key ? categoryPt : translated;
  };
};
