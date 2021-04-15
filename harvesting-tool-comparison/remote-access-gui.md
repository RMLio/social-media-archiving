# Working remotely and needing graphical user interface
To work remotely XMing will be needed to be able to show the GUI which is missing on a command line. 
This method works for a windows 10 ubuntu subsystem accessing remotely using ssh.  
1. Download XMing [here](https://sourceforge.net/projects/xming/)
2. Follow the steps suggested [here](https://gist.github.com/DestinyOne/f236f71b9cdecd349507dfe90ebae776). NOTE: If you have a IdentityFile make sure to uncomment one of the IdentityFile lines and fill in the path to your secret key.
3. Make sure everything works by executing the following command 

```console
xclock
```
If you see a clock popping up then it worked! Now we have succesfully set up the graphical user interface.
