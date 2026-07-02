// Notificaciones deshabilitadas temporalmente
// Se habilitarán cuando se configure EAS y el endpoint del backend

export const registrarNotificaciones = async () => {
  console.log("Notificaciones pendientes de configurar con EAS");
  return null;
};

export const guardarTokenEnBackend = async (pushToken) => {
  console.log("Push token pendiente de configurar:", pushToken);
};