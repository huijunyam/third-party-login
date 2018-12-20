import { Component } from '@angular/core';
import { GooglePlus} from '@ionic-native/google-plus/ngx';
import { from } from 'rxjs';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook/ngx';
import {FirebaseAuthentication} from '@ionic-native/firebase-authentication/ngx';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

    verificationId: string;
    smsForm: FormGroup;
    newUser = false;
    verifyPhoneNumber = false;
    phoneNumberForm: FormGroup;
    userForm: FormGroup;
    signin = false;
    loginSuccess = false;

  constructor(private googlePlus: GooglePlus, private fb: Facebook, private firebaseAuth: FirebaseAuthentication, private formBuilder: FormBuilder) {
    this.smsForm = formBuilder.group({
      smsCode: ['',  Validators.compose([Validators.required])],
    });
    this.phoneNumberForm = formBuilder.group({
      phoneNumber: ['',  Validators.compose([Validators.required])],
    });
    this.userForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });
  }

  login() {
    from(this.googlePlus.login({'webClientId': '918743199091-rro0fjp9g7jnvk4ctd490a03r70jvkfa.apps.googleusercontent.com'})).subscribe(res => console.log('RES ' + JSON.stringify(res)),
      err => console.log('ERR ' + err));
  }

  facebookLogin() {
    this.fb.login(['public_profile'])
      .then((res: FacebookLoginResponse) => console.log('Logged into Facebook! ' + JSON.stringify(res)))
      .catch(e => console.log('Err ' + e));
  }

  verifyPhone() {
    this.verifyPhoneNumber = true;
  }

  validatePhoneNumber() {
    from(this.firebaseAuth.verifyPhoneNumber(this.phoneNumberForm.value.phoneNumber.toString(), 30000))
      .subscribe(verificationId => {
        this.verifyPhoneNumber = false;
        console.log('verificationId', verificationId);
        this.verificationId = verificationId;
      }, (err) => {
        console.log('ERR', err);
      });
  }

  submit() {
    console.log('sms', this.smsForm.value.smsCode.toString());
    from(this.firebaseAuth.signInWithVerificationId(this.verificationId, this.smsForm.value.smsCode.toString()))
      .subscribe((userInfo) => {
        this.verificationId = undefined;
        console.log('USER', JSON.stringify(userInfo));
      }, err => {
        console.log('err', err);
      });
  }

  registerNewUser() {
    this.newUser = true;
  }

  register() {
    const form = this.userForm.value;
    from(this.firebaseAuth.createUserWithEmailAndPassword(form.email, form.password))
      .subscribe(() => {
        this.firebaseAuth.sendEmailVerification();
        this.newUser = false;
        this.signin = true;
      });
  }

  activateSignin() {
    this.signin = true;
    this.newUser = false;
  }

  signinNow() {
    const form = this.userForm.value;
    from(this.firebaseAuth.signInWithEmailAndPassword(form.email, form.password))
      .subscribe((userInfo) => {
        console.log(userInfo);
        this.signin = false;
        this.loginSuccess = true;
      });
  }
}
