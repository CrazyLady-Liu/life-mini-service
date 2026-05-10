const app = getApp();

Page({
  data: {
    markers: [],
    latitude: 39.908823,
    longitude: 116.397470,
    stations: [],
    selectedStation: null
  },

  onLoad(options) {
    this.getLocation();
    if (options.stationId) {
      this.fetchStationDetail(options.stationId);
    }
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude, longitude: res.longitude
        });
        this.fetchNearbyStations(res.latitude, res.longitude);
      }
    });
  },

  async fetchNearbyStations(lat, lng) {
    try {
      const stations = await app.request('/stations/nearby', 'GET', { lat, lng, radius: 5000 });
      const markers = stations.map((station, index) => ({
        id: index,
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0],
        title: station.name,
        iconPath: '/images/marker.png',
        width: 30,
        height: 30
      }));
      this.setData({ stations, markers });
    } catch (err) {
      console.error(err);
    }
  },

  async fetchStationDetail(stationId) {
    try {
      const station = await app.request(`/stations/${stationId}`);
      this.setData({
        selectedStation: station,
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0]
      });
    } catch (err) {
      console.error(err);
    }
  },

  onMarkerTap(e) {
    const { markerId } = e;
    const station = this.data.stations[markerId];
    this.setData({ selectedStation: station });
  },

  navigateToStation() {
    const { selectedStation } = this.data;
    if (!selectedStation) return;
    wx.openLocation({
      latitude: selectedStation.location.coordinates[1],
      longitude: selectedStation.location.coordinates[0],
      name: selectedStation.name,
      address: selectedStation.address
    });
  },

  toScan() {
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({
          url: `/pages/scan/scan?code=${res.result}&stationId=${this.data.selectedStation?._id}`
        });
      }
    });
  }
});
