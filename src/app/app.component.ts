import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as firebase from 'firebase';

// Configuración de Firebase (para manejar la base de datos).
const configFirebase = {
  apiKey: 'AIzaSyAWuY7rBNedd-s8MOZ1vgrcO-FOJdwFQL8',
  authDomain: 'pokemon-38d74.firebaseapp.com',
  databaseURL: 'https://pokemon-38d74.firebaseio.com',
  projectId: 'pokemon-38d74',
  storageBucket: 'pokemon-38d74.appspot.com',
  messagingSenderId: '798867931514'
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Al pulsar el botón de retorno de Android, salimos de la app.
      this.platform.backButton.subscribe(() => {
        navigator['app'].exitApp();
      });
    });

    // Inicialización de Firebase.
    firebase.initializeApp(configFirebase);
  }
}
