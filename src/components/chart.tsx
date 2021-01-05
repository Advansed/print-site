import React, { useEffect } from 'react';
import { Chart } from 'chart.js';
import { IonRow } from '@ionic/react';
import './chart.css'

// interface t_info {
//     Продаж:           string,
//     СуммаПродаж:      string,
//     Возвраты:         string,
//     СуммаВозвратов:   string,
//     Процент:          string,
//     ПроцентВозвратов: string,
// }

const colors= [
  {fon: 'rgba(255, 99, 132, 0.2)', color: 'rgba(255, 99, 132, 1)'},  
  {fon: 'rgba(153, 102, 255, 0.2)', color: 'rgba(153, 102, 255, 0.2)'},
  {fon: 'rgba(255, 206, 86, 0.2)', color: 'rgba(255, 206, 86, 0.2)',},
  {fon: 'rgba(54, 162, 235, 0.2)', color: 'rgba(54, 162, 235, 0.2)'},
  {fon: 'rgba(75, 192, 192, 0.2)', color: 'rgba(75, 192, 192, 0.2)'},
]


interface ContainerProps {
  info
}
  
const LineChart: React.FC<ContainerProps> = ({ info }) => {
//const LineChart: React.FC = () => {

    const c_ref = React.useRef(null)

    useEffect(() => {

      if(info === undefined) return

      let n = 0
      info.datasets.forEach(d=> { 
        d.backgroundColor=colors[n].fon
        d.borderColor=colors[n].color
        ++n
      });

      updateChart(info)
    }, [info]);

    function updateChart(info) {
        const canvas : any = c_ref.current;
        if(canvas === null) return
        const ctx = canvas.getContext('2d');

         new Chart(ctx, {
          type: 'line',
          data: {
              labels: info.labels,
              datasets: info.datasets
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      },
                  }]
              }
          }
        })
    }

    return(
      <>
        <IonRow>
          <canvas ref={ c_ref } 
            // width={300} 
            height={200} 
          ></canvas>
        </IonRow>
      </>
    )

}

export default LineChart
