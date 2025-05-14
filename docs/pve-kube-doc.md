## Kubernetes Homelab Documentation

## 1. System Architecture Overview

The homelab consists of a Kubernetes cluster running on virtual machines hosted by Proxmox VE:

- **Proxmox VE Host**: Single Proxmox VE server (version 8.4.0)
- **Virtual Machines**:
  - **Control Plane Node**: `kubecloud` (VM name: `kube-master`, VMID 114) - IP: 192.168.1.210
  - **Worker Nodes**:
    - `worker-1` (VMID 113) - IP: 192.168.1.211
    - `worker-2` (VMID 115) - IP: 192.168.1.212
- **Operating System**: All nodes running Ubuntu 24.04.2 LTS with kernel 6.8.0-59-generic
- **Container Runtime**: containerd v1.7.24 (with Docker engine v27.5.1 also installed)
- **Kubernetes**: Server v1.30.12, Client v1.30.4

## 2. Proxmox VE Host Configuration

- **Version**: Proxmox VE 8.4.0, kernel 6.8.12-10-pve
- **Cluster Status**: Not part of a Proxmox cluster

### Virtual Machines

| VM ID | Name                 | Role               | Specs                       | MAC Address       |
| ----- | -------------------- | ------------------ | --------------------------- | ----------------- |
| 114   | kube-master          | Control Plane      | 2 cores, 4GB RAM, 45GB disk | BC:24:11:36:2A:B6 |
| 113   | kube-worker-1        | Worker Node        | 2 cores, 4GB RAM, 45GB disk | BC:24:11:0D:9C:0A |
| 115   | kube-worker-2        | Worker Node        | 2 cores, 4GB RAM, 45GB disk | BC:24:11:8E:C6:CD |
| 112   | kube-master-template | Template (stopped) | 2 cores, 4GB RAM, 45GB disk | -                 |

- All VMs use CPU: x86-64-v2-AES with virtio network and SCSI devices

### Network Configuration

- Proxmox host IP: 192.168.1.2/24 on Linux bridge interface `vmbr0`
- Bridge `vmbr0` connected to physical interface `enp2s0`

### Storage Configuration

- **local-lvm**: LVM-Thin storage pool named `data` in volume group `pve`, on NVMe drive (nvme0n1p3)
- **local**: Directory storage at `/var/lib/vz` for ISOs and templates
- **tank**: ZFS pool on device ata-ST4000DM004-2CV104_ZFN2VGXR for backups and data

## 3. Kubernetes Cluster Configuration

### Core Components

- **API Server**: Running at https://192.168.1.210:6443
- **Installation Method**: kubeadm
- **Control Plane Components** (on `kubecloud`):
  - etcd: Healthy (etcd-0), running as static pod `etcd-kubecloud`
  - kube-apiserver: Running as static pod `kube-apiserver-kubecloud`
  - kube-controller-manager: Healthy, running as static pod `kube-controller-manager-kubecloud`
  - kube-scheduler: Healthy, running as static pod `kube-scheduler-kubecloud`

### Node Details

### kubecloud (Control Plane - 192.168.1.210)

- OS: Ubuntu 24.04.2 LTS, Kernel 6.8.0-59-generic
- CPU: 2 cores (QEMU Virtual CPU), Usage: ~46m (2%)
- Memory: 3.8Gi total, Usage: ~1536Mi (40%)
- Disk (/): 21G total, 8.5G used (43%)
- Kubelet: v1.30.4, active and running
- Containerd: v1.7.24, active and running

### worker-1 (192.168.1.211)

- OS: Ubuntu 24.04.2 LTS, Kernel 6.8.0-59-generic
- CPU: 2 cores (QEMU Virtual CPU), Usage: ~17m (0%)
- Memory: 3.8Gi total, Usage: ~1123Mi (29%)
- Disk (/): 21G total, 9.2G used (46%)
- Kubelet: v1.30.4, active and running
- Containerd: v1.7.24, active and running

### worker-2 (192.168.1.212)

- OS: Ubuntu 24.04.2 LTS, Kernel 6.8.0-59-generic
- CPU: 2 cores (QEMU Virtual CPU), Usage: ~15m (0%)
- Memory: 3.8Gi total, Usage: ~1246Mi (32%)
- Disk (/): 21G total, 19G used (92%) - **CRITICAL: High disk usage**
- Kubelet: v1.30.4, active and running
- Containerd: v1.7.24, active and running

### Namespaces

- default
- kube-flannel
- kube-node-lease
- kube-public
- kube-system
- kubernetes-dashboard

## 4. Kubernetes Workloads

### DaemonSets

- **kube-flannel/kube-flannel-ds**:
  - 3 desired, 3 current, 3 ready
  - Image: ghcr.io/flannel-io/flannel:v0.26.7
  - Pods: `kube-flannel-ds-c666v` (worker-2), `kube-flannel-ds-mgxbh` (kubecloud), `kube-flannel-ds-nbslc` (worker-1)
- **kube-system/kube-proxy**:
  - 3 desired, 3 current, 3 ready
  - Image: registry.k8s.io/kube-proxy:v1.30.12
  - Pods: `kube-proxy-c8jw8` (kubecloud), `kube-proxy-m9l47` (worker-1), `kube-proxy-nlqjd` (worker-2)

### Deployments

- **kube-system/coredns**:
  - 2/2 ready
  - Image: registry.k8s.io/coredns/coredns:v1.11.1
  - Pods: `coredns-7db6d8ff4d-n7rj9` (kubecloud), `coredns-7db6d8ff4d-v968m` (worker-1)
- **kube-system/metrics-server**:
  - 1/1 ready
  - Image: registry.k8s.io/metrics-server/metrics-server:v0.7.2
  - Pod: `metrics-server-b79d5c976-vmpd5` (worker-1)
- **kubernetes-dashboard/dashboard-metrics-scraper**:
  - 1/1 ready
  - Image: kubernetesui/metrics-scraper:v1.0.8
  - Pod: `dashboard-metrics-scraper-795895d745-tn9cz` (worker-1)
- **kubernetes-dashboard/kubernetes-dashboard**:
  - 1/1 ready
  - Image: kubernetesui/dashboard:v2.7.0
  - Pod: `kubernetes-dashboard-56cf4b97c5-z29wt` (worker-1)

_Note: No StatefulSets, Jobs, or CronJobs currently deployed_

## 5. Networking Configuration

- **CNI**: Flannel (Image: ghcr.io/flannel-io/flannel:v0.26.7)
- Each node has a `flannel.1` interface and a `cni0` bridge for pod networking

### Pod CIDR Allocation

- **kubecloud** (Control Plane): 10.244.1.0/24 (cni0: 10.244.1.1/24, flannel.1: 10.244.1.0/32)
- **worker-1**: 10.244.0.0/24 (cni0: 10.244.0.1/24, flannel.1: 10.244.0.0/32)
- **worker-2**: 10.244.2.0/24 (cni0: 10.244.2.1/24 [linkdown], flannel.1: 10.244.2.0/32)

### Services

| Namespace            | Service                       | Type      | Cluster IP     | Endpoints                                           |
| -------------------- | ----------------------------- | --------- | -------------- | --------------------------------------------------- |
| default              | kubernetes                    | ClusterIP | 10.96.0.1      | 192.168.1.210:6443                                  |
| kube-system          | kube-dns                      | ClusterIP | 10.96.0.10     | 10.244.0.2:53 (worker-1), 10.244.1.6:53 (kubecloud) |
| kube-system          | metrics-server                | ClusterIP | 10.99.92.252   | 10.244.0.6:10250 (worker-1)                         |
| kubernetes-dashboard | kubernetes-dashboard          | ClusterIP | 10.103.238.194 | 10.244.0.7:8443 (worker-1)                          |
| kubernetes-dashboard | kubernetes-dashboard-nodeport | NodePort  | 10.104.116.21  | 10.244.0.7:8443 (worker-1), node port 30443/TCP     |
| kubernetes-dashboard | dashboard-metrics-scraper     | ClusterIP | 10.103.62.171  | 10.244.0.8:8000 (worker-1)                          |

_Note: No Ingress resources or Ingress controller found_

_Note: No NetworkPolicies found_

## 6. Storage Configuration

_Note: No PersistentVolumes (PVs), PersistentVolumeClaims (PVCs), or StorageClasses currently defined_

## 7. Critical Issues and Observations

### Critical Issues

1. **Disk Pressure on worker-2**:
   - Root filesystem is 92% full (19G used out of 21G)
   - Has triggered FreeDiskSpaceFailed and EvictionThresholdMet events
   - Kubelet logs show eviction manager activity trying to reclaim resources
   - **ACTION REQUIRED**: Investigate disk usage and free up space or expand the virtual disk

### Observations

1. **Kubelet Log Errors on Worker Nodes**:
   - Both worker-1 and worker-2 show errors: "Unable to read config path" err="path does not exist"
   - Possibly related to file_linux.go, cAdvisor stats, or device monitoring
   - Nodes are Ready but these errors should be investigated
2. **cni0 Interface Down on worker-2**:
   - The cni0 bridge interface is in NO-CARRIER,BROADCAST,MULTICAST,UP state and linkdown in routing table
   - Flannel pods and kube-proxy are running, and the node is Ready
   - The flannel.1 interface is UP
   - This might be a transient reporting issue or alternative pod networking configuration
3. **kubeadm config view issue**:
   - Command `sudo kubeadm config view` failed
   - Should use `kubectl -n kube-system get cm kubeadm-config -o yaml` instead
   - The Proxmox VM description for kube-master (VM 114) contains the kubeadm init output with join token and CA cert hash
