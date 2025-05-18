import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeMapComponent } from './components/home-map/home-map.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
    {path: '', component: LandingComponent}, //ruta predeterminada 
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: RegisterComponent},
    { path: 'map', component: HomeMapComponent, canActivate: [AuthGuard] },
    {path: '**', redirectTo: ''} //las rutas que no se encuentran te llevan al landing
    
];


