import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем токены из localStorage (на стороне клиента)
  // В middleware мы не можем напрямую получить доступ к localStorage,
  // но можем проверить наличие токенов в куки
  const accessToken = request.cookies.get('auth-storage')?.value;
  const isAuthenticated = accessToken && accessToken.includes('accessToken');

  // Публичные маршруты, не требующие аутентификации
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если пользователь аутентифицирован и пытается получить доступ к публичному маршруту
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Указываем, для каких маршрутов применять middleware
export const config = {
  matcher: [
    /*
     * Совпадает со всеми путями, кроме:
     * 1. Всех путей, начинающихся с api (API routes)
     * 2. Всех путей, начинающихся с _next/static (статические файлы)
     * 3. Всех путей, начинающихся с _next/image (оптимизированные изображения)
     * 4. Всех путей, начинающихся с favicon.ico (иконка сайта)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
