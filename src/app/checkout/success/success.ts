import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrl: './success.scss',
  imports: [RouterLink],
})
export class SuccessComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      this.orderId = param['orderId'];
    });
  }
  orderId: number = 0;
}
