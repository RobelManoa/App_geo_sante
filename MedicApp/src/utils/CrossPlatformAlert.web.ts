// react-native-web's Alert.alert() is a complete no-op (see
// react-native-web/dist/exports/Alert): it doesn't show anything and never
// calls any button's onPress, so any flow gated behind a confirm dialog
// (e.g. "Se déconnecter") silently does nothing on web. This shim keeps the
// same call signature but actually shows something and fires the right
// callback, using window.alert/confirm.

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

function alert(title: string, message?: string, buttons?: AlertButton[]): void {
  const text = [title, message].filter(Boolean).join('\n\n');

  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  if (buttons.length === 2) {
    const cancelButton = buttons.find((b) => b.style === 'cancel') ?? buttons[0];
    const confirmButton = buttons.find((b) => b !== cancelButton) ?? buttons[1];
    if (window.confirm(text)) {
      confirmButton.onPress?.();
    } else {
      cancelButton.onPress?.();
    }
    return;
  }

  // Plus de 2 boutons : pas d'équivalent simple avec window.confirm (binaire).
  // Aucun flux fonctionnel sur web n'en dépend actuellement (le seul cas,
  // le choix photo de profil, repose de toute façon sur react-native-image-picker
  // qui n'a pas d'implémentation web).
  window.alert(text);
}

export default { alert };
