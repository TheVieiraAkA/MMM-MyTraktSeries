# [Trakt.tv]-Module for the [MagicMirror](https://github.com/MichMich/MagicMirror/)
_This was inspired by MMM-Trakt github.com/Kiina/MMM-trakt, i just upgraded for my personal use, all credits to him

### LINK TO GITHUB


[MMM-MyTraktSeries](https://github.com/TheVieiraAkA/MMM-MyTraktSeries)    

### Preview

![preview](https://raw.githubusercontent.com/TheVieiraAkA/MMM-MyTraktSeries/master/preview.png)


### Todo

- [ ] Pictures for the shows
- [ ] More configuration options


### Creating a [Trakt.tv] API [application]

To get your API keys you need to first create an [Application](https://trakt.tv/oauth/applications). Give it a name, and enter `http://localhost/` in the `Redirect uri:` field and and `Javascript (cors) origins:` _(it's a required field but not used for our purpose)_.


## Installation

Clone the repository into your MagicMirror's modules folder, and install dependencies:

```sh
  cd ~/MagicMirror/modules
  git clone https://github.com/TheVieiraAkA/MMM-MyTraktSeries
  cd MMM-MyTraktSeries
  npm install
```


## Using the Module

To run the module, you need to add the following data to your ` ~/MagicMirror/config/config.js` file:

```
{
    module: "MMM-MyTraktSeries", 
    position: "top_left",           // Configurable
    header: "Trakt - Series",       // Configurable
        config: {
            client_id: "private_id",
            client_secret: "secret_id",
            username: 'username',
            id_lista: "idlist",     // Example: "1234567"
            type: "shows" 
        }
},
```

## Configuration

| Option            | Description
| ----------------- | -----------
| `id_lista`        | To get the id_list you need to go to [This Link](https://trakt.docs.apiary.io/#reference/users/lists/get-a-user's-custom-lists?console=1), using the username in the `URI Parameters` and client_id in the `Headers`, and in the Response, search for the List "ids" and then "trakt" value.



[Trakt.tv]:(https://trakt.tv/)
[application]: (https://trakt.tv/oauth/applications/new)
