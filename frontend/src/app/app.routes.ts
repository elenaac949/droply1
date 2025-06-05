import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { WaterFormComponent } from './components/water-form/water-form.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { SourceModerationComponent } from './components/admin/source-moderation/source-moderation.component';
import { ReviewModerationComponent } from './components/admin/review-moderation/review-moderation.component';
import { ErrorComponent } from './components/error/error.component';

export const routes: Routes = [
    {path: '', component: LandingComponent, canActivate: [NoAuthGuard]}, //ruta predeterminada 
    {path: 'login', component: LoginComponent, canActivate: [NoAuthGuard]},
    {path: 'signup', component: RegisterComponent, canActivate: [NoAuthGuard]},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    {
        path: 'admin', 
        component: AdminComponent, 
        canActivate: [AuthGuard, AdminGuard], 
        children: [
            {path: 'user-management', component: UserManagementComponent},
            {path: 'source-moderation', component: SourceModerationComponent},
            {path: 'review-moderation', component: ReviewModerationComponent},
            {path: '', redirectTo: 'user-management', pathMatch: 'full'} // Ruta por defecto dentro de admin
        ]
    },
    {path: 'water-form', component: WaterFormComponent, canActivate: [AuthGuard] },
    {path: '**', component:ErrorComponent} //las rutas que no se encuentran te llevan al landing
];