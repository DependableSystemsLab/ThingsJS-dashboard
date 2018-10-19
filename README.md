# ThingsJS Dashboard

ThingsJS Dashboard is a web application for monitoring and controlling workers on a [ThingsJS](https://github.com/DependableSystemsLab/ThingsJS) network. This repository contains the source code, while the main ThingsJS package is shipped with the bundled version of the app. This project is built with React.


## Dependencies

The dependencies for this package is the same as the main ThingsJS package: an MQTT Publish/Subscribe server, and a MongoDB server. If you already have ThingsJS installed, you won't need to install any other dependencies outside of NPM.


## Getting Started

If you just want to use the dashboard, the main ThingsJS package already contains a bundled version, which you can start with `things-js dash` command. If you would like to try the development version of the app, you can do so, following the steps below:

1. Clone this project via `git clone`

```
~$ git clone https://github.com/DependableSystemsLab/ThingsJS-dashboard.git
```

2. Install the dependencies via `npm install`

```
~$ cd ThingsJS-dashboard
~/ThingsJS-dashboard$ npm install
```

3. Run the development server via `npm run dev`

```
~/ThingsJS-dashboard$ npm run dev
```

4. You should be able to see the dashboard app on the browser at `http://localhost:8000`.


## Directory Structure

Below is the organization of the project, listing the most relevant files and directories:

```
/public/
/src/
    /client/
        /assets/
        /libs/
        /components/
        /containers/
        /pages/
        /reducers/
        /App.jsx
        /global.css
        /index.jsx
        /index.html
        /store.js
    /server/
        /startApp.js
        /index.js
/webpack.dev.js
/webpack.prod.js
```

1. [`public`](public/) just contains the main `index.html` template for the webpack development server. This file is mostly untouched except when adding third-party JS/CSS from the web.
2. [`src`](src/) contains the all the source code.
    1. [`client`](src/client/) contains the client-side React application.
        1. [`assets`](src/client/assets/) contains static assets used by the React application.
        2. [`libs`](src/client/libs/) contains non-React third-party code. I contains the client-side `things.js` module, which is used to talk to the server-side application.
        3. [`components`](src/client/components/) contains React components that are purely client-side.
        4. [`containers`](src/client/containers/) contains React components that involve/depend on server-side services.
        5. [`pages`](src/client/pages/) contains page-level React components.
        6. [`reducers`](src/client/reducers/) contains React-Redux reducers.
        7. [`App.jsx`](src/client/App.jsx) is the main React App defining the routes and the layout of the application.
        8. [`global.css`](src/client/global.css) is the main CSS.
        9. [`index.jsx`](src/client/index.jsx) is the script that bootstraps the entire React app once the document loads.
        10. [`index.html`](src/client/index.html) is the main page that is served.
        11. [`store.js`](src/client/store.js) is the Redux store file, used in `index.jsx` to tie React and Redux together.
    2. [`server`](src/server/) contains the server-side application, which provides two services: a RESTful API service for the Global File System, and a MQTT-WebSocket Pub/Sub broker service.
3. [`webpack.dev.js`](webpack.dev.js) is the webpack configuration file for *development environment*.
4. [`webpack.prod.js`](webpack.prod.js) is the webpack configuration file for *production environment*.


## License

MIT