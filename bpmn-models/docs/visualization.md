# Візуалізація BPMN-моделей у веб-інтерфейсі

## Загальний опис

Візуалізація BPMN-моделей у веб-інтерфейсі інформаційної системи управління бізнес-діяльністю підприємства дозволяє користувачам переглядати, відстежувати та взаємодіяти з бізнес-процесами. Це забезпечує прозорість процесів та покращує розуміння їх структури та стану.

## Технічна реалізація

### Використання bpmn-js

Для візуалізації BPMN-моделей у веб-інтерфейсі використовується бібліотека [bpmn-js](https://github.com/bpmn-io/bpmn-js), яка дозволяє відображати та взаємодіяти з BPMN-діаграмами безпосередньо у браузері.

#### Встановлення bpmn-js

```bash
npm install bpmn-js
```

#### Базове використання

```javascript
import BpmnViewer from 'bpmn-js/lib/Viewer';

// Створення екземпляру переглядача
const viewer = new BpmnViewer({
  container: '#canvas'
});

// Завантаження BPMN-діаграми
fetch('/api/bpmn-models/order-processing.bpmn')
  .then(response => response.text())
  .then(xml => {
    viewer.importXML(xml, (err) => {
      if (err) {
        console.error('Помилка при імпорті BPMN-діаграми', err);
        return;
      }
      
      // Масштабування діаграми до розміру контейнера
      const canvas = viewer.get('canvas');
      canvas.zoom('fit-viewport');
    });
  });
```

### Інтеграція з React

Для інтеграції BPMN-переглядача з React-компонентами можна створити спеціальний компонент:

```jsx
import React, { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';

const BpmnDiagram = ({ diagramUrl }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    // Створення екземпляру переглядача при монтуванні компонента
    const viewer = new BpmnViewer({
      container: containerRef.current
    });
    
    viewerRef.current = viewer;
    
    // Завантаження BPMN-діаграми
    fetch(diagramUrl)
      .then(response => response.text())
      .then(xml => {
        viewer.importXML(xml, (err) => {
          if (err) {
            console.error('Помилка при імпорті BPMN-діаграми', err);
            return;
          }
          
          // Масштабування діаграми до розміру контейнера
          const canvas = viewer.get('canvas');
          canvas.zoom('fit-viewport');
        });
      });
    
    // Очищення при розмонтуванні компонента
    return () => {
      viewer.destroy();
    };
  }, [diagramUrl]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
    />
  );
};

export default BpmnDiagram;
```

## Відстеження статусу виконання процесів

Для відстеження статусу виконання процесів можна розширити базовий переглядач, додавши підсвічування активних та завершених завдань:

```javascript
// Отримання інформації про статус процесу
fetch(`/api/process-instances/${processInstanceId}`)
  .then(response => response.json())
  .then(processInstance => {
    // Отримання переглядача та елементів діаграми
    const canvas = viewer.get('canvas');
    
    // Підсвічування активних завдань
    processInstance.activeTaskIds.forEach(taskId => {
      canvas.addMarker(taskId, 'active');
    });
    
    // Підсвічування завершених завдань
    processInstance.completedTaskIds.forEach(taskId => {
      canvas.addMarker(taskId, 'completed');
    });
  });
```

Для цього необхідно додати відповідні стилі CSS:

```css
.active {
  stroke: #1e88e5 !important;
  stroke-width: 2px !important;
  fill: #bbdefb !important;
}

.completed {
  stroke: #43a047 !important;
  stroke-width: 2px !important;
  fill: #c8e6c9 !important;
}
```

## Взаємодія з процесами

Для забезпечення взаємодії з процесами (запуск, призупинення, відміна) можна додати відповідні елементи управління:

```jsx
const ProcessControls = ({ processInstanceId, onRefresh }) => {
  const handleSuspend = () => {
    fetch(`/api/process-instances/${processInstanceId}/suspend`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(() => onRefresh());
  };
  
  const handleResume = () => {
    fetch(`/api/process-instances/${processInstanceId}/resume`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(() => onRefresh());
  };
  
  const handleCancel = () => {
    if (window.confirm('Ви впевнені, що хочете скасувати процес?')) {
      fetch(`/api/process-instances/${processInstanceId}/cancel`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(() => onRefresh());
    }
  };
  
  return (
    <div className="process-controls">
      <button onClick={handleSuspend}>Призупинити</button>
      <button onClick={handleResume}>Відновити</button>
      <button onClick={handleCancel}>Скасувати</button>
    </div>
  );
};
```

## Інтеграція з модулями системи

Візуалізація BPMN-моделей інтегрується з іншими модулями системи наступним чином:

### Модуль управління замовленнями

На сторінці деталей замовлення відображається BPMN-діаграма процесу обробки замовлення з підсвіченням поточного етапу.

### Модуль управління товарними запасами

На сторінці управління запасами відображається BPMN-діаграма процесу управління товарними запасами з можливістю запуску процесу поповнення запасів.

### Модуль взаємодії з клієнтами

На сторінці профілю клієнта відображаються активні процеси, пов'язані з цим клієнтом, з можливістю переходу до детального перегляду кожного процесу.

### Модуль фінансового обліку

На сторінці фінансової звітності відображається BPMN-діаграма процесу фінансового обліку з підсвіченням поточних етапів.

## Рекомендації з використання

1. **Розміщення діаграм** - розміщуйте діаграми на окремих вкладках або в модальних вікнах, щоб не перевантажувати інтерфейс.

2. **Інтерактивність** - додайте можливість масштабування та переміщення діаграми для зручності перегляду.

3. **Спрощення** - для кінцевих користувачів можна спростити діаграми, приховавши технічні деталі.

4. **Контекстна інформація** - додайте спливаючі підказки з додатковою інформацією при наведенні на елементи діаграми.

5. **Фільтрація** - додайте можливість фільтрації процесів за статусом, типом, відповідальним тощо.

## Приклад інтеграції з головною сторінкою

```jsx
import React, { useState, useEffect } from 'react';
import BpmnDiagram from '../components/BpmnDiagram';
import ProcessControls from '../components/ProcessControls';

const ProcessMonitoring = () => {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  
  const fetchProcesses = () => {
    fetch('/api/process-instances')
      .then(response => response.json())
      .then(data => setProcesses(data));
  };
  
  useEffect(() => {
    fetchProcesses();
    // Оновлення даних кожні 30 секунд
    const interval = setInterval(fetchProcesses, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="process-monitoring">
      <h1>Моніторинг бізнес-процесів</h1>
      
      <div className="process-list">
        <h2>Активні процеси</h2>
        <ul>
          {processes.map(process => (
            <li 
              key={process.id}
              className={selectedProcess?.id === process.id ? 'selected' : ''}
              onClick={() => setSelectedProcess(process)}
            >
              {process.name} - {process.status}
            </li>
          ))}
        </ul>
      </div>
      
      {selectedProcess && (
        <div className="process-details">
          <h2>{selectedProcess.name}</h2>
          <p>Статус: {selectedProcess.status}</p>
          <p>Початок: {new Date(selectedProcess.startTime).toLocaleString()}</p>
          
          <ProcessControls 
            processInstanceId={selectedProcess.id} 
            onRefresh={fetchProcesses} 
          />
          
          <BpmnDiagram 
            diagramUrl={`/api/bpmn-models/${selectedProcess.definitionKey}.bpmn`} 
            processInstanceId={selectedProcess.id}
          />
        </div>
      )}
    </div>
  );
};

export default ProcessMonitoring;
```

Цей компонент можна інтегрувати в головну сторінку адміністративної панелі системи для забезпечення моніторингу та управління бізнес-процесами.
