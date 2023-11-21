package queue

import (
	"github.com/lcpu-club/paralab/packages/paraci/models"
	"github.com/nsqio/go-nsq"
	clientv3 "go.etcd.io/etcd/client/v3"
)

type ConsumerFactory struct {
	nsqConf  *models.NsqConfigure
	etcdConf *models.EtcdConfigure
}

func NewConsumerFactory(nsqConf *models.NsqConfigure, etcdConf *models.EtcdConfigure) *ConsumerFactory {
	return &ConsumerFactory{
		nsqConf:  nsqConf,
		etcdConf: etcdConf,
	}
}

func (f *ConsumerFactory) NewConsumer(topic, channel string) (*Consumer, error) {
	q := &Consumer{
		f:       f,
		topic:   topic,
		channel: channel,
	}
	cfg := nsq.NewConfig()
	cfg.AuthSecret = f.nsqConf.AuthSecret
	cfg.MsgTimeout = f.nsqConf.MsgTimeout
	cfg.MaxAttempts = uint16(f.nsqConf.MaxAttempts)
	cfg.MsgTimeout = f.nsqConf.MsgTimeout
	cfg.RDYRedistributeInterval = f.nsqConf.RDYRedistributeInterval
	cfg.DefaultRequeueDelay = f.nsqConf.RequeueDelay
	c, err := nsq.NewConsumer(topic, channel, cfg)
	if err != nil {
		return nil, err
	}
	err = c.ConnectToNSQLookupds(f.nsqConf.NsqLookupd.Address)
	if err != nil {
		return nil, err
	}
	etcdClient, err := clientv3.New(clientv3.Config{
		Endpoints: f.etcdConf.Endpoints,
		Username:  f.etcdConf.Username,
		Password:  f.etcdConf.Password,
	})
	etcdClient.
	q.c = c
	q.c.AddHandler(q)
	return q, nil
}

type Consumer struct {
	c        *nsq.Consumer
	f        *ConsumerFactory
	topic    string
	channel  string
	handlers []func()
}

func (q *Consumer) HandleMessage(m *nsq.Message) error {

	return nil
}
