Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "npx tsx src/relayer/RelayerClient.ts", 0, False