import React from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { MapView } from 'expo';
import NavigationBar from 'react-native-navbar';
import { connect } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import style from '../Style';
import BackButton from './containers/buttons/BackButton';
import NavigationBackground from './containers/ui/NavigationBackground';
import CourseRow from './containers/CourseRow';
import { getLocations, getLocationsInText } from '../Utils';

const mapStyle = [
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#ff0000',
            },
        ],
    },
    {
        featureType: 'landscape.man_made',
        elementType: 'labels',
        stylers: [
            {
                color: '#ff0000',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#000000',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#ffffff',
            },
        ],
    },
];

class Course extends React.Component {
    static navigationOptions = ({ navigation }) => {
        let title = navigation.getParam('title', 'Détails');
        let leftButton = <BackButton backAction={navigation.goBack} />;
        return {
            title,
            header: (
                <NavigationBackground>
                    <NavigationBar title={{ title, tintColor: 'white' }} tintColor={'transparent'} leftButton={leftButton} />
                </NavigationBackground>
            ),
        };
    };

    constructor(props) {
        super(props);
        const { data } = this.props.navigation.state.params;

        this.state = {
            data,
            locations: [],
        };

        this.onPressGoogleMaps = this.onPressGoogleMaps.bind(this);
    }

    onPressGoogleMaps() {
        let link = `https://www.google.com/maps/search/?api=1&query=${this.state.locations[0].lat},${this.state.locations[0].lng}`;
        if (this.state.locations[0].placeID) {
            link = `https://www.google.com/maps/search/?api=1&query=${this.state.locations[0].lat},${
                this.state.locations[0].lng
            }&query_place_id=${this.state.locations[0].placeID}`;
        }

        Linking.canOpenURL(link)
            .then((supported) => {
                if (!supported) {
                    console.warn("Can't handle url: " + link);
                } else {
                    return Linking.openURL(link);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    }

    componentDidMount() {
        let locations = [];
        this.props.navigation.setParams({ title: this.state.data.schedule });

        if (this.state.data.room && this.state.data.room !== 'N/C') {
            locations = getLocations(this.state.data.room);
            locations = locations.concat(getLocationsInText(this.state.data.room));
        }
        if (locations.length < 1) {
            locations = getLocationsInText(this.state.data.annotation);
        }

        if (locations.length > 0) {
            this.setState({ locations });
        }
    }

    render() {
        const theme = style.Theme[this.props.themeName];

        let map = null;
        if (this.state.locations.length > 0) {
            map = (
                <View style={{ flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        provider={MapView.PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: this.state.locations[0].lat,
                            longitude: this.state.locations[0].lng,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        customMapStyle={mapStyle}
                        showsMyLocationButton={false}
                        loadingEnabled={true}
                        showsCompass={true}>
                        {this.state.locations.map((location, index) => {
                            return (
                                <MapView.Marker
                                    key={index}
                                    coordinate={{
                                        latitude: location.lat,
                                        longitude: location.lng,
                                    }}>
                                    <View
                                        style={{
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            paddingBottom: 10,
                                        }}>
                                        <View
                                            style={{
                                                backgroundColor: '#E57373',
                                                padding: 4,
                                            }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{location.title}</Text>
                                        </View>
                                        <Image style={{ width: 10, height: 10 }} source={require('./../assets/icons/down.png')} />
                                    </View>
                                </MapView.Marker>
                            );
                        })}
                    </MapView>
                    <View style={{ position: 'absolute', top: 0, right: 0 }}>
                        <TouchableOpacity
                            onPress={this.onPressGoogleMaps}
                            style={{ alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.5)', margin: 8, padding: 4 }}>
                            <View style={{ backgroundColor: '#FFF', padding: 0 }}>
                                <MaterialCommunityIcons name="google-maps" size={32} style={{ width: 32, height: 32, color: '#5f9ea0' }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: theme.greyBackground }}>
                <View>
                    <CourseRow data={this.state.data} theme={theme} />
                </View>
                {map}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.darkMode.themeName,
});

export default connect(mapStateToProps)(Course);