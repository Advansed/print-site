import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router';
import './Page.css';
import 'react-dadata/dist/react-dadata.css';
import { Main, Map, Service, Services } from '../components/Function';
import { datas } from '../components/Store';



const jarr = [
  {name: "Service",   title: "Сервис",     JSX: function():  JSX.Element { return <Service info = { datas.service } />}},
  {name: "Map",   title: "Карта",     JSX: function():  JSX.Element { return <Map />}},
  {name: "Main",   title: "Главная",     JSX: function():  JSX.Element { return <Main />}},

]

const Page: React.FC = () => {

  const [title, setTitle] = useState("Главная")

  const { name } = useParams<{ name: string; }>();

  useEffect(()=>{
    var commentIndex = jarr.findIndex(function(b) { 
        return b.name === name; 
    });
    if(commentIndex >= 0){
      setTitle(jarr[commentIndex].title)  
    }
  }, [name])


  function Content(props:{info}):JSX.Element {

    var commentIndex = jarr.findIndex(function(b) { 
        return b.name === props.info; 
    });
    if(commentIndex >= 0){
      return jarr[commentIndex].JSX()
    }
    return <></>
  }

  return (
    <IonPage onLoad={(e)=>{
    }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{ title }</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent onLoad={(e)=>{
      }}>
        <Content info={ name } />
      </IonContent>
    </IonPage>
  );
};

export default Page;
