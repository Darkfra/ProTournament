import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LandingComponent } from "./component/landing/landing.component";
import { FixedComponent } from "./component/fixed/fixed.component";
import { LoginComponent } from "./component/login/login.component";
import { ProfileComponent } from "./component/profile/profile.component";
import { RegisterComponent } from "./component/register/register.component";

const routes: Routes = [
  {
    path: "landing",component: LandingComponent
  },
  {
    path: "login",component: LoginComponent
  },
  {
    path: "profile",component: ProfileComponent
  },
  {
    path: "register",component: RegisterComponent
  },
  {
    path: "fixed",
    component: FixedComponent
  },
  {
    path: "",
    redirectTo: "landing",
    pathMatch: "full"
  },
  { path: "**", component: LandingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
