import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCol, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonLoading, IonMenuToggle, IonRouterOutlet, IonRow, IonToolbar } from '@ionic/react';
import { arrowBackOutline, folderOpen, folderOutline, folderSharp, image, mailOutline, mailSharp } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { AddressSuggestions } from 'react-dadata';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { socket, Store } from './Store';
import "./Function.css"
import TreeViewMenu from 'react-simple-tree-menu'
import { attachProps } from '@ionic/react/dist/types/components/utils';
import { setSyntheticLeadingComments } from 'typescript';

const { Camera, Geolocation }  = Plugins

defineCustomElements(window)

async function    takePicture() {
  const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Base64,
  source: CameraSource.Photos
  });
  var imageUrl = "data:image/jpeg;base64," + image.base64String;
  
  return imageUrl
  // Can be set to the src of an image no

}


export function Service(props:{info}):JSX.Element {
    const [load, setLoad] = useState(false)
    const [info, setInfo] = useState({
        id:         0,
        name:       "",
        image:      "",
        franchaise: "",
        address:    "",    
        state:      "",
        city:       "",
        locality:   "",
        street:     "",
        home:       "",
        flat:       "",
        lat:        0,
        lng:        0,
    })
    
    useEffect(()=>{
        setInfo(props.info);
    }, [props.info])
    
    async function getFoto(){
        let res = await takePicture()
        const img = new Image();
        img.onload = function(data) {
          console.log("onLoad")
          console.log(img.width + ":" + img.height)
          let ratio = img.width / 100
          let w = img.width / ratio
          let h = img.height / ratio
  
          const elem = document.createElement('canvas');
          elem.width = w;elem.height = h;
  
          const ctx = elem.getContext('2d');
  
          ctx?.drawImage(img, 0, 0, 100, 100);
          info.image = ctx?.canvas.toDataURL("image/png", 1) as string
          setLoad(false);
        }
        img.src = res;
    
    }
      
    let elem = <>
      <IonLoading isOpen={ load } message = "Подождите..." />
      <IonCard class="srv-card ml-auto mr-auto">
        <IonCardHeader>
          <IonButton fill="clear" onClick={()=>{

          }}
          >
            <IonIcon icon = { arrowBackOutline } slot = "icon-only" />
          </IonButton>
          Принт-сервис
        </IonCardHeader>
        <IonCardContent>
          <IonList>
          <IonItem lines="none">
              <IonLabel position="fixed"> Картинка </IonLabel>
              { info.image === "" ? 
                <IonIcon class="srv-icon" icon = { image } onClick={()=>{setLoad(true); getFoto()}}/> 
                : 
                <IonImg src = { info.image }/> 
              }
            </IonItem>
            <IonItem>
              <IonLabel position="stacked"> Наименование </IonLabel>
                <IonInput value={ info.name } 
                  onIonChange={(e) => {
                    let infa = info;
                    infa.name = e.detail.value as string;
                    setInfo(infa);
                  }}
                />
            </IonItem>
            <IonRow>
                <IonLabel class="ml-1 mr-1">Адрес</IonLabel>
            </IonRow>
            <IonRow>
              <IonCol>
                <AddressSuggestions 
                // ref={suggestionsRef} 
                token="23de02cd2b41dbb9951f8991a41b808f4398ec6e"
                // filterLocations ={ dict }
                hintText = "г. Якутск"
                defaultQuery = { info.address }
                onChange={(e)=>{
                    if(e !== undefined){
                        setInfo({
                            id:         info.id,
                            name:       info.name,
                            image:      info.image,
                            franchaise: info.franchaise,
                            address:    e.value as string, 

                            state:      e.data.area === null ? "" : e.data.area_with_type as string,
                            city:       e.data.city === null ? "" : e.data.city_with_type as string,
                            locality:   e.data.settlement === null ? "" : e.data.settlement_with_type as string,
                            street:     e.data.street === null ? "" : e.data.street_with_type as string,
                            home:       e.data.house === null ? "" : e.data.house_type + " " + e.data.house,
                            flat:       e.data.flat === null ? "" : e.data.flat_type + " " + e.data.flat,
                            lat:        e.data.geo_lat === null ? 0.00 : parseFloat(e.data.geo_lat),
                            lng:        e.data.geo_lon === null ? 0.00 : parseFloat(e.data.geo_lon),                        
                            
                        })

                    console.log(e);
                    }
                }}
                />
              </IonCol>  
            </IonRow>
            <IonItem>
              <IonLabel position="stacked"> Щирота </IonLabel>
                <IonInput value={ info.lat as number } 
                  onIonChange={(e) => {
                    info.lat =  parseFloat(e.detail.value as string);
                  }}
                />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked"> Долгота </IonLabel>
                <IonInput value={ info.lng } 
                  onIonChange={(e) => {
                    info.lng = parseFloat(e.detail.value as string);
                  }}
                />
            </IonItem>
          </IonList>
          <IonToolbar>
            <IonRow>
              <IonCol></IonCol>
              <IonCol>
                <IonButton expand="block"
                    onClick={()=>{
                    socket.emit("s_service", info);
                }}
                >
                  Сохранить
                </IonButton>
              </IonCol>
            </IonRow>
          </IonToolbar>
        </IonCardContent>
      </IonCard>

    </>
    return elem
}

export function Services():JSX.Element {
  const [info, setInfo] = useState<any>([]);

  useEffect(()=>{
    console.log("useEffect")
    setInfo(Store.getState().services)
  }, [])


  function Recurs(props:{info, level}):JSX.Element{

    if(props.info === undefined) return <></>
  
    let info = props.info
    let elem = <></>;
    for(let i = 0;i < info.length;i++){

      elem = <>
        { elem }
        <li onClick={()=>{
          //let serv = Store.getState().services;
          console.log(info[i].name + " : " + info[i].nest)
          console.log(info[i].nest === "active")
          if(info[i].nest === "active") info[i].nest = "hidden"
          else info[i].nest = "active"
          
          Store.dispatch({type: "services", services: info})
          setInfo(info);

          console.log(info)

        }}>
          <IonMenuToggle key={ 1 } autoHide={false}>
            <IonItem className={ '' } routerLink={ "/page/Services"} routerDirection = "none" lines = "none" detail = {true}>
              <IonIcon slot="start" ios={ folderSharp } md={ folderOutline } />
              <IonLabel>{  info[i].name }</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <ul className = { info[i].nest }>
            <Recurs info = { info[i].jarr }  level = { props.level + 1 } /> 
          </ul>
        </li>
      </>
    }
    return elem
  }
  
  let elem = <>
    <ul>
      <Recurs info= { info } level = { 0 } />
    </ul>
   
  </>;

  return elem;
}