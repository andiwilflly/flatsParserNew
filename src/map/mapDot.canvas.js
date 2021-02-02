import mapModel from "../models/map.model";


function mapDot() {
    const size = 50;

    return {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        onAdd: function() {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

        render: function() {
            const ctx = this.context;

            const zoom = mapModel.map.getZoom();
            const size = zoom >= 12 ? zoom : zoom/1.5;
            ctx.clearRect(0, 0, this.width, this.height);

            ctx.beginPath();
            ctx.arc( this.width / 2, this.height / 2, size + 3, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.width / 2, this.height / 2, size, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

            this.data = ctx.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            return true;
        }
    };
}

export default mapDot;
