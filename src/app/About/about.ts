import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-about',
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class About {
  readonly values = [
    {
      icon: 'bi-patch-check',
      title: 'Authentic products',
      text: '100% original supplements and gear, sourced from trusted suppliers.',
    },
    {
      icon: 'bi-lightning-charge',
      title: 'Simple and fast',
      text: 'Find what you need, check out in a few steps and track your order from your account.',
    },
    {
      icon: 'bi-chat-dots',
      title: 'Friendly support',
      text: 'Have a question about a product? Our team replies within one business day.',
    },
  ];

  // Placeholder data: this is an educational project, replace with real details if needed.
  readonly contacts = [
    {
      icon: 'bi-envelope',
      label: 'Email',
      value: 'hello@fitplus.example',
      href: 'mailto:hello@fitplus.example',
    },
    { icon: 'bi-telephone', label: 'Phone', value: '+20 100 000 0000', href: 'tel:+201000000000' },
    { icon: 'bi-geo-alt', label: 'Address', value: '12 Example Street, Cairo, Egypt', href: '' },
    {
      icon: 'bi-clock',
      label: 'Working hours',
      value: 'Sat to Thu, 10:00 AM to 10:00 PM',
      href: '',
    },
  ];
}
