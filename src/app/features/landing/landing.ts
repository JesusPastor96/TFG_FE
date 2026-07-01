import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LandingComponent {
  mobileOpen = false;
  currentYear = new Date().getFullYear();

  navLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'Precios', href: '#precios' },
  ];

  brands = [
    'La Terraza',
    'El Fogón',
    'Casa Blanca',
    'Sabor Urbano',
    'Mariscos del Puerto',
    'Bistro Central',
  ];

  features = [

    {
      iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
      title: 'Gestión de mesas',
      description: 'Configura el plano de tu restaurante, asigna mesas automáticamente y optimiza la distribución.'
    },
    {
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      title: 'Turnos y horarios',
      description: 'Define turnos de servicio personalizados y controla la disponibilidad por hora.'
    },
    {
      iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      title: 'Gestion de plantilla',
      description: 'Organiza los turnos de tu plantilla y asigna tareas a cada uno.'
    }
  ];

  steps = [
    {
      number: '01',
      iconPath: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',
      title: 'Configura tu restaurante',
      description: 'Registra tu establecimiento y define tu plano de mesas en minutos.'
    },
    {
      number: '02',
      iconPath: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
      title: 'Configura tu plantilla',
      description: 'Registra a tu plantilla y asigna responsabilidades a cada uno.'
    },
    {
      number: '03',
      iconPath: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3m3 3l3.5 3.5m-3.5-3.5l4.5-4.5M6 6s.5-3.5 3.5-3.5s3.5 3.5 3.5 3.5s-3.5.5-3.5 3.5S6 6 6 6z',
      title: 'Gestiona y crece',
      description: 'Optimiza tu restaurante y haz crecer tu negocio.'
    }
  ];

  stats = [
    { value: '2,500+', label: 'Restaurantes activos' },
    { value: '1.2M', label: 'Reservas gestionadas' },
    { value: '40%', label: 'Menos ausencias' },
    { value: '98%', label: 'Satisfacción' },
  ];

  testimonials = [
    {
      name: 'María González',
      quote: 'Desde que usamos TeamPlate, las ausencias se redujeron drásticamente.',
      role: 'La Terraza',
      rating: 5
    },
    {
      name: 'Carlos Mendoza',
      quote: 'La gestión de turnos era un caos antes. Ahora todo está automatizado.',
      role: 'El Fogón',
      rating: 5
    },
    {
      name: 'Ana Rodríguez',
      quote: 'Hemos aumentado los ingresos un 25% en solo 3 meses.',
      role: 'Sabor Urbano',
      rating: 4
    }
  ];

  plans = [
    {
      name: 'Básico',
      price: '29',
      features: ['100 reservas/mes', 'Calendario básico', 'Email reminders'],
      popular: false,
      cta: 'Registrarse'
    },
    {
      name: 'Profesional',
      price: '79',
      features: ['Reservas ilimitadas', 'Gestión de mesas', 'SMS reminders', 'Analítica'],
      popular: true,
      cta: 'Registrarse'
    },
    {
      name: 'Enterprise',
      price: 'Personalizado',
      features: ['Multi-ubicación', 'API personalizada', 'Soporte 24/7'],
      popular: false,
      cta: 'Contactar'
    }
  ];

  footerSections = [
    {
      title: 'Producto',
      links: [
        { label: 'Funcionalidades', href: '#funcionalidades' },
        { label: 'Precios', href: '#precios' },
        { label: 'Demo', href: '#' },
      ]
    },
    {
      title: 'Compañía',
      links: [
        { label: 'Sobre nosotros', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carreras', href: '#' },
      ]
    }
  ];

  toggleMenu() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMenu() {
    this.mobileOpen = false;
  }

  starsArray(n: number): number[] {
    return Array(n).fill(0);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Logic for sticky header if needed
  }
}
