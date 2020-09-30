import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCol, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonLoading, IonMenuToggle, IonRouterOutlet, IonRow, IonText, IonToolbar } from '@ionic/react';
import { arrowBackOutline, folderOpen, folderOutline, folderSharp, image, mailOutline, mailSharp } from 'ionicons/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { AddressSuggestions } from 'react-dadata';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { socket, Store } from './Store';
import "./Function.css"
import { withScriptjs, Marker, withGoogleMap, GoogleMap } from 'react-google-maps';

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

export function Services(props:{info}):JSX.Element {

  let info = props.info;
  
  function Recurs(props:{info, level}):JSX.Element{

    if(props.info === undefined) return <></>
  
    let elem = <></>;let item = <></>;
    for(let i = 0;i < props.info.length;i++){
      if(props.info[i].jarr === undefined){
        item = <>
          <IonItem className={ '' } routerLink={ "" } routerDirection = "none" lines = "none" detail = {false}
            onClick={()=>{
              let coords = {
                latitude: props.info[i].lat,
                longitude: props.info[i].lng,
            }
            console.log("coords")
            console.log(coords)
              Store.dispatch({type: "s_coord", s_coord: coords })  
              console.log(Store.getState().s_coord)

            }}
          >
            <IonIcon slot="start" ios={ mailSharp } md={ mailOutline } />
            <IonLabel>{  props.info[i].name }</IonLabel>
          </IonItem>
        </>

      } else {
        item = <>
          <IonItem 
            routerLink={ "/page/Services" } 
            routerDirection = "none" 
            lines = "none" 
            detail = {true}
            onClick={()=>{
              //let serv = Store.getState().services;
              console.log(props.info[i].name + " : " + props.info[i].nest)
              console.log(props.info[i].nest === "active")
              if(props.info[i].nest === "active") props.info[i].nest = "hidden"
              else props.info[i].nest = "active"
              
              Store.dispatch({type: "services", services: info})

              let coords = Store.getState().s_coord;

              coords.coords.latitude = props.info[i].lat;
              coords.coords.longitude = props.info[i].lng;

              Store.dispatch({type: "s_coord", s_coord: coords})
              console.log("coords")              
              console.log(Store.getState().s_coord)
              console.log(coords)

              console.log(info)

            }}
          >
            <IonIcon slot="start" ios={ folderSharp } md={ folderOutline } />
            <IonLabel>{  props.info[i].name }</IonLabel>
            {/* <IonText>{  props.info[i].lat + " : " + props.info[i].lng }</IonText> */}
          </IonItem>
          <ul className = { props.info[i].nest }>
            <Recurs info = { props.info[i].jarr }  level = { props.level + 1 } /> 
          </ul>    
        </>  
    }

      elem = <>
        { elem }
        <li>
          { item }
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


const MyMapComponent = withScriptjs(withGoogleMap((props:any) => {
  //62.0275204,129.7125726,16.99 62.030322, 129.714982\

    let serv      = props.services //Store.getState().services;
    let position  = props.position
    let item = <></>
    for(let i = 0;i < serv.length; i++){
      item = <>
        { item }
        <Marker position = { { lat: serv[i].lat, lng: serv[i].lng } }  label = { serv[i].name } onClick={()=>{
          Store.dispatch({type: "params", params: serv[i]});
        }} />
      </>
    }

  return <>
    <GoogleMap 
      defaultZoom={ 14 }
      defaultCenter={{ lat: position.coords.latitude, lng: position.coords.longitude }}
    >
      { item }
    </GoogleMap>
    </>
  }
  ))

export function Map():JSX.Element {
  const [position, setPosition] = useState<any>(Store.getState().s_coord)

  Store.subscribe({num: 2, type: "s_coord", func: ()=>{
    setPosition(Store.getState().s_coord);
    console.log("s_coord")
    console.log(Store.getState().s_coord)
  }})


  let elem = <>
      <MyMapComponent
          isMarkerShown = { true }
          services = { Store.getState().services }
          position = { position }
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyB_p9u6xDi9Jc2ys-BC_u5zaE1J91G0a48&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `100%` }} />}
          mapElement={<div style={{ height: `100%` }} />}
      />
    </>;

  return elem;
}