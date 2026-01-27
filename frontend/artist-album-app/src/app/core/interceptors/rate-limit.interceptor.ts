import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Rate Limit Interceptor
 * Intercepta respostas HTTP 429 (Too Many Requests) e exibe uma mensagem apropriada
 */
export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        showRateLimitWarning();
      }
      return throwError(() => error);
    })
  );
};

function showRateLimitWarning(): void {
  // Verifica se já existe uma mensagem ativa
  const existingAlert = document.querySelector('.rate-limit-alert');
  if (existingAlert) {
    return;
  }

  // Cria o elemento de alerta
  const alert = document.createElement('div');
  alert.className = 'rate-limit-alert';
  alert.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(238, 90, 111, 0.4);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    min-width: 320px;
    max-width: 420px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  alert.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 24px; flex-shrink: 0;">⚠️</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">
          Limite de Requisições Atingido
        </div>
        <div style="font-size: 14px; opacity: 0.95; line-height: 1.5;">
          Você excedeu o limite de requisições permitidas. Por favor, aguarde alguns instantes antes de tentar novamente.
        </div>
      </div>
      <button style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
         onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'" 
         onclick="this.closest('.rate-limit-alert').remove()">×</button>
    </div>
  `;

  // Adiciona animação CSS se ainda não existe
  if (!document.querySelector('#rate-limit-animations')) {
    const style = document.createElement('style');
    style.id = 'rate-limit-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(alert);

  // Remove automaticamente após 8 segundos com animação
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 300);
  }, 8000);
}
