export class Dapp {
  constructor(
    public id: string,
    public version: string,
    public name: string,
    public shortName: string,
    public description: string,
    public startUrl: string,
    public icons: any[],
    public authorName: string,
    public authorEmail: string,
    public category: string,
    public urls: any[],
    public isFav: boolean,
  ) {}
}
