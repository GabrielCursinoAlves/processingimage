const MultipartConfig = {
    fileSize: 2 * 1024 * 1024,
    fieldNameSize: 100, 
    headerPairs: 2000, 
    fieldSize: 100,    
    parts: 1000,         
    fields: 10,        
    files: 1           
}
const AllTypesMultipart = [
    "image/png", 
    "image/jpeg", 
    "image/jpg", 
    "image/gif", 
    "image/webp",
];

export { MultipartConfig, AllTypesMultipart };