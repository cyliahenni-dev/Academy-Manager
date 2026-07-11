window.addEventListener('DOMContentLoaded', () => {
  window.alert = function (message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = "position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: #2c3e50; color: white; padding: 14px 28px; border-radius: 8px; z-index: 999999; font-size: 16px; font-family: 'Segoe UI', Tahoma, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.3); direction: rtl;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };
});