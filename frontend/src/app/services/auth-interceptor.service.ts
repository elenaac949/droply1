import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de autenticación.
 * 
 * Si hay un token almacenado en localStorage, lo añade a las cabeceras 
 * de cada petición HTTP saliente en el formato: `Authorization: Bearer <token>`.
 * 
 * Esto permite que todas las peticiones protegidas se envíen con el JWT automáticamente.
 * 
 * @param req Petición HTTP original
 * @param next Función para pasar la petición modificada al siguiente interceptor
 * @returns Petición con el token, si existe
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
