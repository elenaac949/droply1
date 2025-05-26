import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { WaterFormComponent } from './components/water-form/water-form.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { MapComponent } from './components/map/map.component';



export const routes: Routes = [
    {path: '', component: LandingComponent}, //ruta predeterminada 
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: RegisterComponent},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    {path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    {path: 'water-form', component: WaterFormComponent, canActivate: [AuthGuard] },
    {path: '**', redirectTo: ''} //las rutas que no se encuentran te llevan al landing
    
];


