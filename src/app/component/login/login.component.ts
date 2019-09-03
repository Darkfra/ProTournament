import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

declare function loadLogin(): any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private serviceAuth: AuthService) { }

  ngOnInit() {
    loadLogin();
  }

  loginGoogle(){
    this.serviceAuth.doGoogleLogin();
  }
  loginFacebook(){
    this.serviceAuth.doFacebookLogin();
  }

}
