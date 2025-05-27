import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  loginError: string | undefined;
  registrationSuccess = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  this.route.queryParams.subscribe(params => {
    this.registrationSuccess = params['registered'] === '1';
  });
  }


  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loginError = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => {
        this.loginError = err.error?.message || 'Login incorrecto';
      }
    });
  }


}
