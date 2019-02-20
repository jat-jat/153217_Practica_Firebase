import { Component } from '@angular/core';
import { LoadingController, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { PushNotificationsService } from '../push-notifications.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Referencia a la base de datos.
  readonly refDb: firebase.database.Reference;
  // Expresión regular que sólo admite letras del idioma español.
  readonly regexTxt: RegExp;
  // Lista de pokemones
  pokemones: any;
  /* Bandera que indica si los pokemones han sido cargados exitosamente. */
  cargaCorrecta = false;

  constructor(private loadCtrl: LoadingController, public acShCrtl: ActionSheetController,
    private alertCtrl: AlertController, public toastCtrl: ToastController,
    private notif: PushNotificationsService) {
      this.regexTxt = new RegExp(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ' -]{2,}$/);
      this.refDb = firebase.database().ref();
  }

  /**
   * Evento que se suscita cuando se muesta la página.
   */
  ionViewWillEnter() {
    this.cargarPokemones();
  }

  /**
   * Muestra una alerta básica (que únicamente muestra un mensaje) en la interfaz.
   */
  async mostrarAlertaSimple(header, subHeader, message) {
    const alert = await this.alertCtrl.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Muestra un toast (un rectángulo con un texto), en el centro de la pantalla, por un par de segundos.
   * @param texto El texto que contendrá el toast.
   */
  async mostrarToastSimple(texto: string) {
    const toast = await this.toastCtrl.create({
      message: texto,
      position: 'middle',
      duration: 2000
    });

    toast.present();
  }

  /**
   * Carga todos los pokemones y los muestra en la interfaz.
   */
  async cargarPokemones() {
    const msgCargando = await this.loadCtrl.create({
      message: 'Cargando...'
    });

    await msgCargando.present()
      .then(() => {
        // Se hace la petición a Firebase.
        this.refDb.on('value', snapshot => {
          const pokemones = [];
          
          // Se arma el arreglo de pokemones.
          snapshot.forEach(childSnaphot => {
            const item = childSnaphot.val();
            item.key = childSnaphot.key;
            pokemones.push(item);
          });

          this.pokemones = pokemones;
          this.cargaCorrecta = true;
          msgCargando.dismiss();
        });
      }).catch(error => {
        console.error(error);
        msgCargando.dismiss();
        this.mostrarAlertaSimple(`Error`, null,
          'No se pudo establecer una conexión exitosa con el servidor.');
      });
  }

  /**
   * Hace uso de Firebase, para crear o modificar un pokemon.
   * @param idPokemonViejo El id del pokemon a modifificar o nulo, si se va a crear uno.
   * @param datosPokemon Objetos con los datos de un pokemon nuevo, o los datos a actualizar.
   */
  async guardarCambiosCrearOModificar (keyPokemonViejo, datosPokemon){
    const msgCargando = await this.loadCtrl.create({
      message: (keyPokemonViejo ? 'Guardando cambios...' : 'Creando...')
    });

    await msgCargando.present()
      .then(() => {
        if (keyPokemonViejo) {
          // Se modifica.
          return firebase.database().ref(keyPokemonViejo).update(datosPokemon);
        } else {
          // Se crea.
          const insert = this.refDb.push();
          return insert.set(datosPokemon);
        }
      }).then(() => {
        msgCargando.dismiss();
        // Gracias a firebase, no es necesario recargar.

        if (!keyPokemonViejo){
          // Le avisamos a los demás usuarios que creamos un pokemón.
          const mensaje = `Alguien creó al Pokemón '${datosPokemon.nombre}'.`;
          this.notif.notificarATodos('Gestor de pokemones', mensaje).subscribe(
            response => {
              console.log('Se notificó a los demás usuario de la creación de este pokemón.');
            }, error => {
              console.error(error);
            });
        }
      }) .catch(error => {
        console.error(error);

        msgCargando.dismiss();
        this.mostrarAlertaSimple(`Error`, null,
          'No se pudo establecer una conexión exitosa con el servidor.');
      });
  }

  /**
   * Muestra los controles necesarios y contiene la lógica, para crear o modificar un pokemón.
   * @param pokemon Objeto con los datos de un pokemón, si es que se va a modificar.
   */
  async crearOModificarPokemon(pokemon = null) {
    const alert = await this.alertCtrl.create({
      header: (pokemon ? 'Modificar pokemón' : 'Crear pokemón'),
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: (pokemon ? pokemon.nombre : ''),
          placeholder: 'Nombre'
        },
        {
          name: 'tipo',
          type: 'text',
          value: (pokemon ? pokemon.tipo : ''),
          placeholder: 'Tipo'
        },
        {
          name: 'zona',
          type: 'text',
          value: (pokemon ? pokemon.zona : ''),
          placeholder: 'Zona'
        },
        {
          name: 'generacion',
          type: 'number',
          value: (pokemon ? pokemon.generacion : null),
          min: 1,
          max: 7,
          placeholder: 'Generación'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Guardar',
          handler: (nuevo) => {
            // Se preparan los valores tipo string.
            for (const aux in nuevo) {
              if (typeof nuevo[aux] === 'string'){
                // Se borran espacios de más. '  Hola    mundo ' -> 'Hola mundo'
                nuevo[aux] = nuevo[aux].trim().replace(/  +/g, ' ');
                // Se hace que la primera letra sea mayúscula y el resto, minúsculas.
                nuevo[aux] = nuevo[aux].toLowerCase();
                nuevo[aux] = nuevo[aux].charAt(0).toUpperCase() + nuevo[aux].slice(1);
              }
            }

            // Validación de datos.
            if (!this.regexTxt.test(nuevo.nombre)) {
              this.mostrarToastSimple('El nombre es inválido.');
              return false;
            } else if (!this.regexTxt.test(nuevo.tipo)) {
              this.mostrarToastSimple('El tipo es inválido.');
              return false;
            } else if (!this.regexTxt.test(nuevo.zona)) {
              this.mostrarToastSimple('La zona es inválida.');
              return false;
            } else if (nuevo.generacion < 1 || nuevo.generacion > 7) {
              this.mostrarToastSimple('Sólo hay 7 generaciones.');
              return false;
            } else {
              // Todos los datos son válidos.
              this.guardarCambiosCrearOModificar((pokemon ? pokemon.key : null), nuevo);
              return true;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Elimina un pokemon existente.
   * @param key La llave del pokemón que desea eliminar.
   */
  async eliminarPokemon(key) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Está seguro de que desea eliminar este pokemón?<br><strong>No podrá deshacer esta acción.</strong>',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Sí',
          handler: async () => {
            const msgCargando = await this.loadCtrl.create({
              message: 'Eliminando...'
            });
        
            await msgCargando.present()
              .then(() => firebase.database().ref(key).remove())
              .then(() => {
                msgCargando.dismiss();
                // Gracias a firebase, no es necesario recargar.
              }).catch((error) => {
                console.error(error);
                msgCargando.dismiss();
                this.mostrarAlertaSimple(`Error`, null,
                  'No se pudo establecer una conexión exitosa con el servidor.');
              });
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Muestra las opciones para un determinado pokemón.
   * @param pokemon Objeto con los datos de un pokemón.
   */
  async mostrarMenuPokemon(pokemon) {
    var buttons = [{
      text: 'Editar',
      icon: 'create',
      handler: () => { this.crearOModificarPokemon(pokemon); }
    }, {
      text: 'Eliminar',
      role: 'destructive',
      icon: 'trash',
      handler: () => { this.eliminarPokemon(pokemon.key); }
    }];

    const actionSheet = await this.acShCrtl.create({
      header: 'Opciones de este pokemón',
      buttons: buttons
    });

    await actionSheet.present();
  }
}
