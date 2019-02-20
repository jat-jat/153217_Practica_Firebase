import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { v4 as uuid } from 'uuid';
import { Firebase } from '@ionic-native/firebase/ngx';
import { ToastController } from '@ionic/angular';

/**
 * Este servicio hace uso de 'firebase-messaging-sw.js', un script que escucha las notificaciones
 * mientras la app está en segundo plano.
 * 
 * Este script está declarado dentro del arreglo 'assets', en 'angular.json'.
 * Se manda a llamar automáticamente por la librería.
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  // Datos necesarios para hacer peticiones HTTP.
  // Ubicada en 'Consola de Firebase > Proyecto > Configuración > Mensajería en la nube > Credenciales de proyecto'.
  readonly clave_servidor = 'AAAAugA9QXo:APA91bHlgXbrnqb22FOLugIG9EZtqHof4LgxEg9eXlGNMoFlaNOvBSwiKp2' +
    'L_yebSuDf7tnRoJ7WtE1wzx6z_0lQDsNmOFCh10X0q2O8Fk2RwsRCWiBiHEzYyUCgXgnKOiq6c6ohLpuw';
  // Cabeceras de las peticiones HTTP para trabajar con el proyecto de Firebase.
  readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `key=${this.clave_servidor}`
  });

  // ID de esta instancia de la app. Para diferenciar mensajes propios, de los ajenos.
  readonly id_usuario = uuid();

  // Token de registro de esta instancia de app, provista por Firebase.
  token: String;

  constructor(private firebase: Firebase, private http: HttpClient, private toastCtrl: ToastController) {
    // Obtenemos un token para esta instancia.
    firebase.getToken()
      .then((token) => {
        console.log('PUSH NOTIFICATIONS: Se obtuvo el token.', token);
        this.token = token;
        
        // Nos suscribimos al tema genérico 'all'.
        return firebase.subscribe('all');
      }).then(() => {
        console.log('PUSH NOTIFICATIONS: Suscrito al tema genérico.');
      }).catch(e => {
        console.error(e);
        this.token = null;
      });
    
    // Se define el evento de cuando el token cambia.
    this.firebase.onTokenRefresh()
      .subscribe((token: string) => this.token = token);
    
    // Se define el evento de cuando se recibe una notificación.
    this.firebase.onNotificationOpen().subscribe (data => {
      // Si la notificación proviene de nosotros mismos, no la mostramos.
      if((data.id_usuario) && (data.id_usuario == this.id_usuario)) { 
        return;
      }

      // Se muestra la notificación dentro de la app.
      this.mostrarToastSimple(data.body);
    });
  }

  /**
   * Muestra un toast (un rectángulo con un texto), en el centro de la pantalla, por un par de segundos.
   * @param texto El texto que contendrá el toast.
   */
  async mostrarToastSimple(texto: string) {
    const toast = await this.toastCtrl.create({
      message: texto,
      position: 'bottom',
      duration: 2000
    });

    toast.present();
  }

  /**
   * Envía una notificación a todos aquellos que tengan abierta la app.
   * @param titulo El título de la notificación. Sólo se muestra cuando el usuario tiene la aplicación en 2o plano.
   * @param mensaje El contenido de la notificación.
   */
  notificarATodos(titulo:String, mensaje:String){
    const url = 'https://fcm.googleapis.com/fcm/send';
    const cuerpoPeticion = {
      data: {
        title: titulo,
        body: mensaje,
        id_usuario: this.id_usuario
      },
      to: '/topics/all'
    };

    return this.http.post(url, cuerpoPeticion, { headers: this.headers });
  }
}
