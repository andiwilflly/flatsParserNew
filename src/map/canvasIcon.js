import L from 'leaflet';
import mapModel from '../models/map.model';


(function () {

    /**
     * Canvas Icon
     * @type {L.CanvasIcon}
     * @extends {L.Icon}
     */
    L.CanvasIcon = L.Icon.extend({
        options: {
            iconSize: [mapModel.dotSize, mapModel.dotSize],
            iconAnchor: [mapModel.dotSize/2, mapModel.dotSize/2],
            drawIcon: null,
            className: 'leaflet-canvas-icon'
        },

        /**
         * @param {HTMLElement} icon
         * @returns {HTMLCanvasElement}
         */
        createIcon: function (icon) {
            var size = L.point(this.options.iconSize);

            if (!icon || (icon.tagName != 'CANVAS')) {
                icon = document.createElement('canvas');
            }

            icon.width = size.x;
            icon.height = size.y;

            this._setIconStyles(icon, 'icon');

            return icon;
        },

        /**
         * @param {HTMLElement} icon
         * @returns {null}
         */
        createShadow: function (icon) {
            return null;
        },

        /**
         * @param {HTMLElement} icon
         * @param {string} type
         * @private
         */
        _setIconStyles: function (icon, type) {
            if (typeof this.options.drawIcon == 'function') {
                this.options.drawIcon.apply(this, arguments);
            }

            L.Icon.prototype._setIconStyles.apply(this, arguments);
        }
    });

    /**
     * Canvas Icon factory
     * @param {Object} options
     * @returns {L.CanvasIcon}
     */
    L.canvasIcon = function (options) {
        return new L.CanvasIcon(options);
    };
})();