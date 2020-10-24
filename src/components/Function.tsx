import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCheckbox, IonCol, IonGrid, IonIcon, IonImg
    , IonInput, IonItem, IonLabel, IonList, IonLoading, IonRow, IonText, IonToolbar } from '@ionic/react';
import { arrowBackOutline, calendar, documentOutline, image, imagesOutline, listOutline, mapOutline, personOutline, removeOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { AddressSuggestions } from 'react-dadata';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { socket, Store } from './Store';
import "./Function.css"
import { withScriptjs, Marker, withGoogleMap, GoogleMap } from 'react-google-maps';
import LineChart from './chart';


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

export function   Service(props:{info}):JSX.Element {
    const [load, setLoad] = useState(false)
    const [info, setInfo] = useState({
        id:         0,
        name:       "",
        image:      "",
        franchaise: "",
        address:    "",    
        country:    "",
        region:     "",
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
                            country:    e.data.country      === null ? "" : e.data.country,  
                            region:     e.data.region       === null ? "" : e.data.region_with_type as string,
                            state:      e.data.area         === null ? "" : e.data.area_with_type as string,
                            city:       e.data.city         === null ? "" : e.data.city_with_type as string,
                            locality:   e.data.settlement   === null ? "" : e.data.settlement_with_type as string,
                            street:     e.data.street       === null ? "" : e.data.street_with_type as string,
                            home:       e.data.house        === null ? "" : e.data.house_type + " " + e.data.house,
                            flat:       e.data.flat         === null ? "" : e.data.flat_type + " " + e.data.flat,
                            lat:        e.data.geo_lat      === null ? 0.00 : parseFloat(e.data.geo_lat),
                            lng:        e.data.geo_lon      === null ? 0.00 : parseFloat(e.data.geo_lon),                        
                            
                        })
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

function          CheckAll(info){
  let checked = info.checked;
  if(info.jarr !== undefined){
    let jarr = info.jarr;
    for(let i = 0;i < jarr.length;i++){
      jarr[i].checked = checked;
      if(jarr[i].jarr !== undefined) CheckAll(jarr[i])
    }
  }
}

export function   Services(props:{info}):JSX.Element {
  const [upd, setUpd] = useState(0)
  
  Store.subscribe({num: 2, type: "services", func:()=>{
    setUpd(upd + 1)   
  }})


  let info = props.info;

  function Recurs(props:{info, level}):JSX.Element{
    const [checked, setChecked] = useState(false)

    if(props.info === undefined) return <></>
    if(props.info === null) return <></>
  
    let elem = <></>;let item = <></>;
    for(let i = 0;i < props.info.length;i++){
      if(props.info[i].jarr === undefined){
        item = <>
          <IonItem  

            lines = "none" detail = {false}
            onClick={()=>{
              let coords = {
                latitude: props.info[i].lat,
                longitude: props.info[i].lng,
            }
              Store.dispatch({type: "s_coord", s_coord: coords })  

            }}
          >

            <IonCheckbox slot="start" checked = { props.info[i].checked } onIonChange={()=>{
              props.info[i].checked = !props.info[i].checked
              Store.dispatch({type: "services", services: Store.getState().services});
            }} />
            <IonLabel>{  props.info[i].name }</IonLabel>
          </IonItem>
        </>

      } else {
        item = <>
          <IonItem 
            // routerLink={ "/page/Services" } 
            // routerDirection = "none" 
            lines = "none" 
            detail = {true}
            onClick={()=>{

              Store.dispatch({type: "markers", markers: props.info[i].coords});

              let coords = Store.getState().s_coord;

              coords.coords.latitude = props.info[i].coords[0].lat as number;
              coords.coords.longitude = props.info[i].coords[0].lng as number;

              Store.dispatch({type: "s_coord", s_coord: coords})

            }}
          >
            <IonCheckbox slot="start" checked = { props.info[i].checked } onIonChange={()=>{
              props.info[i].checked = !props.info[i].checked
              CheckAll(props.info[i]);
              Store.dispatch({type: "services", services: Store.getState().services});
            }} />
            {/* <IonIcon slot="start" ios={ folderSharp } md={ folderOutline } /> */}
            <IonLabel>{  props.info[i].name }</IonLabel>
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

function          getMarkers(info){
//  let info = Store.getState().services;
  let jarr: any; jarr = [];
  for(let i = 0;i < info.length;i++){
    if(info[i].jarr === undefined){
      jarr = [...jarr, info[i]]
    } else {
      let jja = getMarkers(info[i].jarr);
      jarr = [...jarr, ...jja]
    }
  }  
  
  return jarr
}

const MyMapComponent = withScriptjs(withGoogleMap((props:any) => {
  //62.0275204,129.7125726,16.99 62.030322, 129.714982\


    let serv      = getMarkers(Store.getState().services);

    let position  = props.position

    let item = <></>
    for(let i = 0;i < serv.length; i++){
      if(!serv[i].checked) continue
      item = <>
        { item }
        <Marker position = { { lat: serv[i].coords.lat, lng: serv[i].coords.lng } }  label = { serv[i].coords.name } onClick={()=>{
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


export function   Map():JSX.Element {
  const [position, setPosition] = useState<any>(Store.getState().s_coord)
  const [upd, setUpd] = useState(0);

  Store.subscribe({num: 3, type: "s_coord", func: ()=>{
    setPosition(Store.getState().s_coord);
  }})

  Store.subscribe({num: 4, type: "services", func: ()=>{
    setUpd(upd + 1);
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

function          Charts():JSX.Element {
  const [info, setInfo] = useState<any>({
    year: undefined,
    month: undefined
  })
  const [upd, setUpd] = useState(0);

  let checkeds: any; checkeds = [];
  
  function getAll(info){

    for(let i = 0;i < info.length;i++){
        if(info[i].jarr !== undefined) getAll(info[i].jarr)
        else {
          if(info[i].checked)
          checkeds = [...checkeds, info[i].id]
        }
      }
  }

  Store.subscribe({num: 7, type: "services", func: ()=>{
    console.log("charts")
    setUpd(upd + 1);
  }})


  useEffect(()=>{

    getAll(Store.getState().services);

    socket.once("method_charts", (data)=>{
      let jarr = data[0][0]
      let param = {
        year: {
          labels: JSON.parse(jarr.y_labels),
          datasets: [{
            label: "График за год",
            data: JSON.parse(jarr.y_data)
          }]
        },
        month: {
          labels: JSON.parse(jarr.m_labels),
          datasets: [
            {label: "График за месяц", data: JSON.parse(jarr.m_data)}
          ]
        },
      }
      setInfo(param);
    })

    socket.emit("method", {
      method: "charts",
      date: "2020-09-01",
      param: checkeds
    })

  }, [upd])
  let elem = <>
    <div className="chrt-div">
      <LineChart info = { info.year }/>
    </div>
    <div className="chrt-div">
      <LineChart info = { info.month }/>
    </div>
  </>
  return elem;
}

function          Docs(): JSX.Element {
  const [info, setInfo] = useState<any>({jarr: [], summary: 0});
  const [upd, setUpd] = useState(0);

  let param: any; param = [];
  
  function getAll(info){

    for(let i = 0;i < info.length;i++){
        if(info[i].jarr !== undefined) getAll(info[i].jarr)
        else {
          if(info[i].checked)
            param = [...param, info[i].id]
        }
      }
  }

  Store.subscribe({num: 5, type: "services", func: ()=>{
    setUpd(upd + 1);
  }})

  useEffect(()=>{

    getAll(Store.getState().services);
    socket.once("method_docs", (data)=>{    
      setInfo(data[0][0].json)
    })
    socket.emit("method", {
      method: "docs",
      param: param
    })
  },[upd])

  let elem = <></>
  if(info === null) return <></>
  if(info === undefined) return <></>

  let items = info.jarr;

  for(let i = 0;i < items.length; i++){
    elem = <>
      { elem }
      <IonItem>
        <IonIcon icon={ documentOutline } slot="start"/>
        <IonGrid>
        <IonRow>
          <IonCol>
            <IonText> <b> { items[i].Документ} </b> </IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="2">
            <IonText><b>{ items[i].СуммаДокумента }</b></IonText>
          </IonCol>
          <IonCol>
            <IonCardSubtitle> { items[i].Сервис } </IonCardSubtitle>
          </IonCol>
          <IonCol>
            <IonCardSubtitle> { items[i].Пользователь } </IonCardSubtitle>
          </IonCol>
        </IonRow>
        </IonGrid>
      </IonItem>
    </>
  }

  return elem;
}

function          List():JSX.Element {
  const [info, setInfo] = useState<any>([])

  useEffect(()=>{
    socket.once("method_service_list", (data)=>{    
      console.log(data[0])
      setInfo(data[0])
    })
    socket.emit("method", {
      method: "service_list",
    })
  }, [])
  
  function ItemA(props:{info}):JSX.Element {
    let info = props.info;
    let elem = <></>
    if(info.jarr === undefined){
      elem = <>
        <IonCard>
          <IonItem lines="none">
            <IonIcon icon = { imagesOutline } slot="start" />
            <IonLabel> { info.name } </IonLabel>
          </IonItem>
        </IonCard>
      </>
    } else {
      elem = <>
        <IonCard>
          <IonItem lines="none">
            <IonIcon icon = { personOutline } slot="start" />
            <IonLabel> { info.franchaiser } </IonLabel>
          </IonItem>
        </IonCard>
      </>
    }

    return elem;
  }
  
  let elem = <></>

  for(let i = 0;i < info.length;i++){
    elem = <>
      { elem }
      <ItemA info={ info[i].json } />
    </>
  }

  elem = <>
    <div className="mn-div">
      { elem }
    </div>
  </>
  return elem;
}

export function   Main():JSX.Element {
  const [page, setPage] = useState(0)
  let elem = <></>

  function Content(){
    let elem = <></>;
    switch(page){
      case 0: return <Map     />
      case 1: return <Charts  />
      case 2: return <Docs    />
      case 3: return <List    />
    }
    return elem;
  }

  elem = <>
    <IonToolbar>
      <IonButton class="mn-button" fill="clear" onClick={ ()=> setPage(0)}><IonIcon icon={ mapOutline } ></IonIcon></IonButton>
      <IonButton class="mn-button" fill="clear" onClick={ ()=> setPage(1)}><IonIcon icon={ documentOutline } ></IonIcon></IonButton>
      <IonButton class="mn-button" fill="clear" onClick={ ()=> setPage(2)}><IonIcon icon={ calendar } ></IonIcon></IonButton>
      <IonButton class="mn-button" fill="clear" onClick={ ()=> setPage(3)}><IonIcon icon={ listOutline } ></IonIcon></IonButton>
    </IonToolbar>

    <Content />
  </>

  return elem;
}