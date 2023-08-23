export function fileSize(size, multiplierIdx=-1){
    if (res > 1024) {
        return fileSize(size/1024, multiplierIdx+1);
    } else {
        return {size, multiplierIdx}
    }
}
