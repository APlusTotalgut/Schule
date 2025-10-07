class Scheibe{
    constructor(ctx,x,y,radius,color){
        this.ctx = ctx;
        this.x = x;
        this.y = 0;
        this.endy = y;
        this.radius = radius
        this.color = color
        this.speed = 10;
    }

    set(){
        this.ctx.strokeStyle = '#aaa'
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        if (this.y + this.speed > this.endy){
            this.y = this.endy
        }else{
            this.y = this.y + this.speed;
        }
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        this.ctx.stroke();
        this.ctx.fill()
    }
}